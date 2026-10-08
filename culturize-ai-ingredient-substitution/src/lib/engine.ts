import { flagForCuisine } from "@/lib/cuisines";
import { INGREDIENT_BY_ID, matchIngredient, normalize, stemText } from "@/lib/kb";
import { cuisineStoreTags, looksCommon, matchGeneric, type GenericRule } from "@/lib/kb/generic";
import { TAG_WHERE } from "@/lib/kb/stores";
import type {
  BuyItem,
  CulturizedRecipe,
  DishTemplate,
  RawRecipe,
  RecipeSource,
  RecipeIngredient,
  ShoppingGroup,
  ShoppingStyle,
  SpecialtyIngredient,
  StoreInfo,
  StoreKind,
  StoreRef,
  StoresResult,
  StoreTag,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Store selection                                                     */
/* ------------------------------------------------------------------ */

const MAINSTREAM_KINDS: StoreKind[] = ["supermarket", "big_box", "natural", "warehouse"];

export function toRef(s: StoreInfo): StoreRef {
  return { id: s.id, name: s.name, distanceMi: s.distanceMi, kind: s.kind };
}

const carries = (s: StoreInfo, tags: StoreTag[]) => s.tags.some((t) => tags.includes(t));
const round2 = (n: number) => Math.round(n * 100) / 100;

function pseudoDistance(stores: StoreInfo[], s: StoreInfo): number {
  // Regional fallbacks have no distance: treat list order as "how common nearby".
  return s.distanceMi ?? stores.indexOf(s) * 0.8;
}

/** Pick the one mainstream store that covers the most of this recipe, nearby. */
function choosePrimary(stores: StoreInfo[], specialty: SpecialtyIngredient[]): StoreInfo | null {
  const candidates = stores.filter((s) => s.tags.includes("mainstream"));
  if (candidates.length === 0) return stores[0] ?? null;
  let best: StoreInfo | null = null;
  let bestScore = -Infinity;
  for (const s of candidates) {
    let coverage = 0;
    for (const ing of specialty) {
      if (carries(s, ing.foundAt)) {
        coverage += 1;
      } else {
        const sub = ing.substitutes.filter((x) => carries(s, x.foundAt)).sort((a, b) => b.match - a.match)[0];
        coverage += sub ? (sub.match / 100) * 0.8 : 0;
      }
    }
    const score =
      (coverage / Math.max(1, specialty.length)) * 10 - pseudoDistance(stores, s) * 0.6 + s.tags.length * 0.1;
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

class StorePicker {
  constructor(
    readonly stores: StoreInfo[],
    readonly primary: StoreInfo | null,
    readonly style: ShoppingStyle,
  ) {}

  /** Best store for an item with these availability tags (primary first to minimize trips). */
  pick(tags: StoreTag[]): StoreInfo | null {
    if (this.primary && carries(this.primary, tags)) return this.primary;
    if (this.style === "one-stop") return null;
    const options = this.stores.filter((s) => carries(s, tags));
    options.sort((a, b) => pseudoDistance(this.stores, a) - pseudoDistance(this.stores, b));
    return options[0] ?? null;
  }

  common(): StoreInfo | null {
    return this.primary ?? this.stores.find((s) => s.tags.includes("mainstream")) ?? this.stores[0] ?? null;
  }
}

const WHERE_ORDER: StoreTag[] = [
  "asian",
  "indian",
  "latin_specialty",
  "latin",
  "middle_eastern",
  "african_caribbean",
  "european",
  "natural",
  "international",
  "warehouse",
];

export function whereToFind(tags: StoreTag[]): string {
  if (tags.includes("mainstream")) return TAG_WHERE.mainstream;
  return WHERE_ORDER.filter((t) => tags.includes(t))
    .slice(0, 2)
    .map((t) => TAG_WHERE[t])
    .join(" or ");
}

/* ------------------------------------------------------------------ */
/* Quantities                                                          */
/* ------------------------------------------------------------------ */

const FRACTIONS: Record<string, number> = { "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75, "⅛": 0.125 };
const NUM = String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d*[½⅓⅔¼¾⅛]|\d+(?:\.\d+)?)`;
const QTY_RE = new RegExp(`^(${NUM})(?:\\s*[–-]\\s*(${NUM}))?`);

function parseNum(raw: string): number {
  const s = raw.trim();
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return +mixed[1] + +mixed[2] / +mixed[3];
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return +frac[1] / +frac[2];
  const uni = s.match(/^(\d*)([½⅓⅔¼¾⅛])$/);
  if (uni) return (uni[1] ? +uni[1] : 0) + FRACTIONS[uni[2]];
  return parseFloat(s);
}

function formatNum(n: number): string {
  if (n >= 10) return String(Math.round(n));
  const whole = Math.floor(n);
  const rest = n - whole;
  const options: [number, string][] = [
    [0, ""], [0.125, "⅛"], [0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"], [1, ""],
  ];
  let best = options[0];
  for (const o of options) if (Math.abs(o[0] - rest) < Math.abs(best[0] - rest)) best = o;
  const w = best[0] === 1 ? whole + 1 : whole;
  if (w === 0 && !best[1]) return "⅛";
  return `${w > 0 ? w : ""}${best[1]}`;
}

export function scaleQty(qty: string, factor: number): string {
  if (Math.abs(factor - 1) < 0.01) return qty;
  const m = qty.match(QTY_RE);
  if (!m) return qty;
  const a = formatNum(parseNum(m[1]) * factor);
  const b = m[2] ? formatNum(parseNum(m[2]) * factor) : null;
  return `${b ? `${a}–${b}` : a}${qty.slice(m[0].length)}`;
}

/* ------------------------------------------------------------------ */
/* Ingredient resolution                                               */
/* ------------------------------------------------------------------ */

/** Only perishables scale with servings — a jar of spice covers any batch size. */
const PERISHABLE = new Set(["Produce", "Meat & Seafood", "Dairy", "Refrigerated", "Frozen", "Deli", "Bakery", "Rice & Grains"]);
const scalePrice = (price: number, aisle: string, f: number) => round2(PERISHABLE.has(aisle) ? price * f : price);
const scaleBuy = (buy: BuyItem[], f: number): BuyItem[] => buy.map((b) => ({ ...b, price: scalePrice(b.price, b.aisle, f) }));

function commonIngredient(
  name: string,
  qty: string,
  aisle: string,
  price: number,
  picker: StorePicker,
  priceFactor: number,
): RecipeIngredient {
  const store = picker.common();
  return {
    original: name,
    quantity: qty,
    status: "easy",
    use: name,
    buy: [{ product: name, aisle, price: scalePrice(price, aisle, priceFactor) }],
    ratio: null,
    store: store ? toRef(store) : null,
    match: 100,
    why: null,
    alternatives: [],
    authenticWhere: null,
  };
}

function pantryIngredient(name: string, qty: string): RecipeIngredient {
  return {
    original: name,
    quantity: qty,
    status: "pantry",
    use: name,
    buy: [],
    ratio: null,
    store: null,
    match: 100,
    why: null,
    alternatives: [],
    authenticWhere: null,
  };
}

function resolveSpecialty(
  ing: SpecialtyIngredient,
  qty: string,
  picker: StorePicker,
  priceFactor: number,
  displayName?: string,
): { ingredient: RecipeIngredient; phrase: string } {
  const authenticWhere = whereToFind(ing.foundAt);
  let authStore = picker.pick(ing.foundAt);
  const available = ing.substitutes
    .map((sub) => ({ sub, store: picker.pick(sub.foundAt) }))
    .filter((x) => x.store !== null)
    .sort((a, b) => b.sub.match - a.sub.match);

  // Don't send someone to a second ordinary supermarket for one item when a strong swap
  // is already on the shelf at their main store. Specialty markets are always worth the trip.
  let primarySwap: (typeof available)[number] | undefined;
  const primaryId = picker.primary?.id;
  if (authStore && picker.style === "authentic" && primaryId && authStore.id !== primaryId && MAINSTREAM_KINDS.includes(authStore.kind)) {
    const atPrimary = available.find((x) => x.store?.id === primaryId);
    if (atPrimary && atPrimary.sub.match >= 85) {
      authStore = null;
      primarySwap = atPrimary;
    }
  }

  if (authStore) {
    return {
      phrase: ing.short,
      ingredient: {
        original: displayName ?? ing.name,
        quantity: qty,
        status: "authentic_nearby",
        use: ing.name,
        buy: scaleBuy([ing.authentic], priceFactor),
        ratio: null,
        store: toRef(authStore),
        match: 100,
        why: `Head to the ${ing.authentic.aisle.toLowerCase()} section at ${authStore.name} — it should carry the real thing, so no swap needed.`,
        alternatives: available.slice(0, 2).map((x) => ({
          name: x.sub.name,
          match: x.sub.match,
          storeName: x.store?.name ?? null,
        })),
        authenticWhere,
      },
    };
  }

  const fallback = ing.substitutes.find((s) => s.foundAt.includes("mainstream")) ?? ing.substitutes[0];
  const chosen = primarySwap ?? available[0] ?? { sub: fallback, store: null };
  return {
    phrase: chosen.sub.short,
    ingredient: {
      original: displayName ?? ing.name,
      quantity: qty,
      status: "swap",
      use: chosen.sub.name,
      buy: scaleBuy(chosen.sub.buy, priceFactor),
      ratio: chosen.sub.ratio,
      store: chosen.store ? toRef(chosen.store) : null,
      match: chosen.sub.match,
      why: chosen.sub.why,
      alternatives: available
        .filter((x) => x.sub !== chosen.sub)
        .slice(0, 2)
        .map((x) => ({ name: x.sub.name, match: x.sub.match, storeName: x.store?.name ?? null })),
      authenticWhere,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Finalizing                                                          */
/* ------------------------------------------------------------------ */

function computeAuthenticity(ings: RecipeIngredient[]): number {
  let weight = 0;
  let total = 0;
  for (const i of ings) {
    if (i.status === "pantry" || i.status === "specialty") continue;
    const w = i.status === "easy" ? 1 : 3;
    weight += w;
    total += w * i.match;
  }
  return weight ? Math.round(total / weight) : 100;
}

function buildShopping(ings: RecipeIngredient[]): ShoppingGroup[] {
  const groups = new Map<string, ShoppingGroup>();
  for (const ing of ings) {
    if (ing.status === "pantry") continue;
    const key = ing.store?.id ?? "any";
    const group = groups.get(key) ?? { store: ing.store, items: [], subtotal: 0 };
    for (const item of ing.buy) {
      const existing = group.items.find((x) => normalize(x.product) === normalize(item.product));
      if (existing) {
        if (!existing.forIngredient.split(", ").includes(ing.original)) existing.forIngredient += `, ${ing.original}`;
        existing.price = Math.max(existing.price, item.price);
      } else {
        group.items.push({ product: item.product, aisle: item.aisle, price: item.price, forIngredient: ing.original });
      }
    }
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((g) => ({
      ...g,
      items: g.items.sort((a, b) => a.aisle.localeCompare(b.aisle) || a.product.localeCompare(b.product)),
      subtotal: round2(g.items.reduce((n, i) => n + i.price, 0)),
    }))
    .sort((a, b) => b.items.length - a.items.length);
}

export interface RecipeMeta {
  dishName: string;
  cuisine: string;
  country: string | null;
  flag: string;
  region: string | null;
  description: string;
  image: string | null;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: string;
}

export function finalizeRecipe(args: {
  meta: RecipeMeta;
  ingredients: RecipeIngredient[];
  steps: string[];
  tips: string[];
  swapPhrases: string[];
  storesResult: StoresResult;
  style: ShoppingStyle;
  engine: "culturize" | "openai";
  source?: RecipeSource;
}): CulturizedRecipe {
  const shopping = buildShopping(args.ingredients);
  return {
    ...args.meta,
    authenticity: computeAuthenticity(args.ingredients),
    swapCount: args.ingredients.filter((i) => i.status === "swap").length,
    authenticFoundCount: args.ingredients.filter((i) => i.status === "authentic_nearby").length,
    style: args.style,
    location: args.storesResult.location,
    stores: args.storesResult.stores,
    storeSource: args.storesResult.source,
    ingredients: args.ingredients,
    shopping,
    shoppingTotal: round2(shopping.reduce((n, g) => n + g.subtotal, 0)),
    steps: args.steps,
    tips: args.tips,
    swapPhrases: [...new Set(args.swapPhrases)],
    unverifiedCount: args.ingredients.filter((i) => i.status === "specialty").length,
    source: args.source,
    engine: args.engine,
    generatedAt: new Date().toISOString(),
  };
}

function smartTips(ings: RecipeIngredient[]): string[] {
  const tips: string[] = [];
  const swaps = ings.filter((i) => i.status === "swap");
  const weakest = [...swaps].sort((a, b) => a.match - b.match)[0];
  if (weakest && weakest.match < 72 && weakest.authenticWhere) {
    tips.push(
      `${weakest.original} is the hardest to replicate (~${weakest.match}% match). If you pass ${weakest.authenticWhere}, grab the real thing — it makes a noticeable difference.`,
    );
  }
  const specialtyFinds = ings.filter(
    (i) => i.status === "authentic_nearby" && i.store && !MAINSTREAM_KINDS.includes(i.store.kind),
  );
  if (specialtyFinds.length > 0) {
    const store = specialtyFinds[0].store!;
    const names = specialtyFinds.filter((i) => i.store?.id === store.id).slice(0, 3).map((i) => i.original.toLowerCase());
    tips.push(`Good news: ${store.name} should carry authentic ${names.join(", ")} — worth the extra stop.`);
  }
  const unverified = ings.filter((i) => i.status === "specialty");
  if (unverified.length > 0) {
    tips.push(
      `We don't have a tested swap for ${unverified.slice(0, 3).map((i) => i.original.toLowerCase()).join(", ")}${unverified.length > 3 ? " and more" : ""} yet — check the suggested market or use Ingredient Finder to look up a different regional name.`, 
    );
  }
  if (swaps.length > 0) {
    tips.push("Taste as you go — substitutes can be milder or saltier than the originals, so adjust seasoning at the end.");
  }
  return tips;
}

const clampServings = (n: number) => Math.min(24, Math.max(1, Math.round(n || 4)));

/* ------------------------------------------------------------------ */
/* Dish mode                                                           */
/* ------------------------------------------------------------------ */

export function culturizeDish(
  dish: DishTemplate,
  storesResult: StoresResult,
  servingsInput: number | undefined,
  style: ShoppingStyle,
): CulturizedRecipe {
  const servings = clampServings(servingsInput ?? dish.servings);
  const factor = servings / dish.servings;
  const priceFactor = Math.max(1, factor);
  const specialty = dish.ingredients
    .map((i) => (i.kind === "kb" ? INGREDIENT_BY_ID.get(i.ref) : undefined))
    .filter((i): i is SpecialtyIngredient => Boolean(i));
  const primary = choosePrimary(storesResult.stores, specialty);
  const picker = new StorePicker(storesResult.stores, primary, style);
  const phrases = new Map<string, string>();
  const swapPhrases: string[] = [];

  const ingredients = dish.ingredients.map((di): RecipeIngredient => {
    if (di.kind === "kb") {
      const ing = INGREDIENT_BY_ID.get(di.ref);
      if (!ing) return commonIngredient(di.ref, scaleQty(di.qty, factor), "International", 3.99, picker, priceFactor);
      const r = resolveSpecialty(ing, scaleQty(di.qty, factor), picker, priceFactor);
      phrases.set(ing.id, r.phrase);
      if (r.ingredient.status === "swap") swapPhrases.push(r.phrase);
      return r.ingredient;
    }
    if (di.kind === "pantry") return pantryIngredient(di.name, scaleQty(di.qty, factor));
    return commonIngredient(di.name, scaleQty(di.qty, factor), di.aisle, di.price, picker, priceFactor);
  });

  const steps = dish.steps.map((s) =>
    s.replace(/\{([a-z0-9-]+)\}/g, (_, id: string) => phrases.get(id) ?? INGREDIENT_BY_ID.get(id)?.short ?? id),
  );

  return finalizeRecipe({
    meta: {
      dishName: dish.name,
      cuisine: dish.cuisine,
      country: dish.country,
      flag: dish.flag,
      region: dish.region,
      description: dish.description,
      image: dish.image,
      servings,
      prepMinutes: dish.prep,
      cookMinutes: dish.cook,
      difficulty: dish.difficulty,
    },
    ingredients,
    steps,
    tips: [...dish.tips, ...smartTips(ingredients)],
    swapPhrases,
    storesResult,
    style,
    engine: "culturize",
    source: { kind: "library", name: "Culturize kitchen library", url: null },
  });
}

/* ------------------------------------------------------------------ */
/* Any recipe: pasted, imported from the web, or from TheMealDB         */
/* ------------------------------------------------------------------ */

const UNIT =
  "(?:cups?|c\\.|tbsps?|tablespoons?|tsps?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|l|liters?|litres?|cloves?|pieces?|pinch(?:es)?|cans?|bunch(?:es)?|stalks?|sprigs?|leaves|packets?|sticks?|handfuls?|slices?|heads?|dash(?:es)?|large|medium|small)";
const LINE_RE = new RegExp(`^(${NUM}(?:\\s*[–-]\\s*${NUM})?(?:\\s*${UNIT}\\b\\.?)*)\\s*(?:of\\s+)?(.*)$`, "i");

const PANTRY = new Set([
  "salt", "kosher salt", "sea salt", "water", "warm water", "hot water", "cold water", "oil", "vegetable oil",
  "cooking oil", "canola oil", "olive oil", "extra virgin olive oil", "black pepper", "pepper", "salt and pepper", "salt pepper",
  "sugar", "ice", "granulated sugar", "white sugar", "freshly ground black pepper", "ground black pepper", "boiling water",
]);

const AISLE_RULES: [RegExp, string, number][] = [
  [/\b(broth|stock|bouillon)\b/, "Soups & Broths", 2.49],
  [/\b(tomato paste|tomato sauce|coconut milk|coconut cream|canned)\b/, "Canned Goods", 1.49],
  [/\b(soy sauce|vinegar|ketchup|mustard|mayo|mayonnaise|hot sauce|sriracha|hoisin|oyster sauce|worcestershire)\b/, "Condiments", 2.99],
  [/\b(powder|cumin|coriander|turmeric|paprika|cinnamon|cloves?|cardamom|nutmeg|allspice|oregano|bay leaf|bay leaves|peppercorns?|garam masala|seeds?|spice|seasoning|star anise|fennel|dried thyme|dried basil|dried mint|cayenne|chili flakes)\b/, "Spices", 2.99],
  [/\b(chicken|beef|pork|lamb|goat|mutton|turkey|shrimp|prawns?|fish|salmon|cod|tilapia|catfish|sausages?|bacon|steak|ribs|oxtail|tripe|crab|mussels|clams|ham|duck|veal|mince)\b/, "Meat & Seafood", 7.99],
  [/\b(milk|cream|butter|yogh?urt|cheese|eggs?|buttermilk)\b/, "Dairy", 3.49],
  [/\b(onions?|garlic|ginger|tomato(es)?|peppers?|chil(i|e|li)(e?s?)?|potato(es)?|carrots?|celery|cabbage|spinach|kale|lettuce|cilantro|parsley|mint|basil|thyme|rosemary|scallions?|leeks?|limes?|lemons?|oranges?|avocados?|plantains?|yams?|cucumbers?|eggplants?|zucchini|squash|okra|mushrooms?|sprouts|corn|apples?|bananas?|mangos?|mangoes|pineapple|greens|herbs?|dill|shallots?)\b/, "Produce", 1.99],
  [/\b(rice|quinoa|couscous|bulgur|oats|lentils?|dal|beans|chickpeas|split peas)\b/, "Rice & Grains", 2.99],
  [/\b(flour|yeast|baking|cornstarch|cocoa|chocolate|vanilla|honey|molasses|brown sugar)\b/, "Baking", 2.99],
  [/\b(noodles?|pasta|spaghetti|vermicelli|macaroni)\b/, "Pasta", 1.99],
  [/\b(tofu)\b/, "Refrigerated", 2.49],
  [/\b(peanuts?|almonds?|cashews?|walnuts?|pistachios?|raisins?|dates|nuts)\b/, "Snacks & Nuts", 3.99],
  [/\b(bread|tortillas?|pita|naan|buns?|rolls?)\b/, "Bakery", 2.99],
  [/\b(wine|sherry|beer|rum)\b/, "Wine & Cooking Wine", 6.99],
];

function guessAisle(name: string): [string, number] {
  const n = normalize(name);
  for (const [re, aisle, price] of AISLE_RULES) if (re.test(n)) return [aisle, price];
  return ["Grocery", 3.49];
}

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

function splitIngredientLines(text: string): string[] {
  let lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 1 && lines[0].includes(",")) lines = lines[0].split(",").map((s) => s.trim());
  return lines
    .map((l) => l.replace(/^(\d+[.)]\s+|[-*•▪●◦]\s*)/, "").trim())
    .filter(Boolean)
    .slice(0, 60);
}

function splitSteps(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^(step\s*\d+[:.)-]?\s*|\d+[.)]\s*|[-*•]\s*)/i, "").trim())
    .filter(Boolean)
    .slice(0, 40);
}

/** Strip preparation notes and packaging words so "1 (14 oz) can coconut milk, shaken" → "coconut milk". */
function cleanName(name: string): string {
  let n = name.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  n = n.split(/\s*[,;]\s*|\s+[–—]\s+/)[0] ?? n;
  n = n.replace(/\b(to taste|as needed|optional|for serving|for garnish|for frying|divided|plus more)\b.*$/i, "").trim();
  for (let i = 0; i < 3; i++) n = n.replace(/^(?:cans?|packages?|packets?|jars?|bottles?|large|medium|small|big|heaping|scant|generous|good|of)\s+/i, "");
  return n.replace(/[.:]+$/, "").trim();
}

function parseLine(line: string): { qty: string; name: string } {
  const loose = line.match(/^(?:a|an)?\s*(pinch|dash|handful|splash|drizzle|bunch)(?:es)?\s+(?:of\s+)?(.+)$/i);
  if (loose) return { qty: capitalize(loose[1].toLowerCase()), name: cleanName(loose[2]) };
  const m = line.match(LINE_RE);
  if (m && m[2]) return { qty: m[1].trim(), name: cleanName(m[2]) };
  return { qty: "", name: cleanName(line) };
}

interface ParsedItem {
  qty: string;
  name: string;
}
interface SwapNote {
  alias: string;
  original: string;
  phrase: string;
  ratio: string | null;
}
interface ResolveCtx {
  picker: StorePicker;
  priceFactor: number;
  factor: number;
  cuisine: string | null;
  swapPhrases: string[];
  swapNotes: SwapNote[];
}

function unknownIngredient(display: string, qty: string, ctx: ResolveCtx): RecipeIngredient {
  const tags = cuisineStoreTags(ctx.cuisine);
  const store = ctx.picker.pick(tags) ?? ctx.picker.common();
  const where = whereToFind(tags);
  return {
    original: display,
    quantity: qty,
    status: "specialty",
    use: display,
    buy: [{ product: display, aisle: "International", price: scalePrice(3.99, "International", ctx.priceFactor) }],
    ratio: null,
    store: store ? toRef(store) : null,
    match: 0,
    why: `This one isn't in our swap library yet, so we can't promise a tested substitute. Look in ${where}${store ? ` — ${store.name} is your best bet nearby` : ""}. If you find something that works, share it in the Swap Library so the next cook benefits.`,
    alternatives: [],
    authenticWhere: where,
  };
}

function syntheticFromRule(rule: GenericRule, display: string, cuisine: string | null): SpecialtyIngredient {
  const cuisineTags = cuisineStoreTags(cuisine);
  void cuisineTags;
  return {
    id: `generic-${rule.id}`,
    name: display,
    short: display.toLowerCase(),
    aliases: [],
    cuisines: [],
    category: rule.category,
    foundAt: [], // generic families never claim the real thing is on a shelf — they offer a tested swap
    authentic: { ...rule.authentic, product: display },
    substitutes: rule.substitutes,
  };
}

function resolveParsed(p: ParsedItem, m: { ing: SpecialtyIngredient; alias: string } | null, ctx: ResolveCtx): RecipeIngredient {
  const display = capitalize(p.name);
  const qty = p.qty ? scaleQty(p.qty, ctx.factor) : "";
  const note = (r: { ingredient: RecipeIngredient; phrase: string }, alias: string) => {
    if (r.ingredient.status === "swap") {
      ctx.swapPhrases.push(r.phrase);
      ctx.swapNotes.push({ alias, original: display, phrase: r.phrase, ratio: r.ingredient.ratio });
    }
    return r.ingredient;
  };
  if (m) return note(resolveSpecialty(m.ing, qty || "as needed", ctx.picker, ctx.priceFactor, display), m.alias);
  if (PANTRY.has(normalize(p.name))) return pantryIngredient(display, qty || "to taste");
  const rule = matchGeneric(p.name);
  if (rule) {
    const synthetic = syntheticFromRule(rule, display, ctx.cuisine);
    const resolved = resolveSpecialty(synthetic, qty || "as needed", ctx.picker, ctx.priceFactor, display);
    const cuisineTags = cuisineStoreTags(ctx.cuisine).filter((t) => t !== "international");
    resolved.ingredient.authenticWhere = whereToFind(cuisineTags.length ? cuisineTags : rule.tags);
    return note(resolved, stemText(p.name));
  }
  if (looksCommon(p.name)) {
    const [aisle, price] = guessAisle(p.name);
    return commonIngredient(display, qty || "as needed", aisle, price, ctx.picker, ctx.priceFactor);
  }
  return unknownIngredient(display, qty || "as needed", ctx);
}

export interface ItemsInput {
  items: { qty: string | null; name: string }[];
  steps: string[] | null;
  meta: {
    dishName: string;
    cuisine: string | null;
    country: string | null;
    description: string | null;
    image: string | null;
    prepMinutes: number;
    cookMinutes: number;
    difficulty: string;
  };
  baseServings: number | null;
  servings: number | undefined;
  source: RecipeSource;
}

export function culturizeItems(input: ItemsInput, storesResult: StoresResult, style: ShoppingStyle): CulturizedRecipe {
  const parsed: ParsedItem[] = input.items
    .map((it) => (it.qty === null ? parseLine(it.name) : { qty: it.qty.trim(), name: cleanName(it.name) }))
    .filter((p) => p.name)
    .slice(0, 60);
  const matches = parsed.map((p) => matchIngredient(p.name));

  // Work out the cuisine first so unfamiliar ingredients can be pointed at the right kind of market.
  const counts = new Map<string, number>();
  for (const m of matches) if (m) for (const c of m.ing.cuisines) counts.set(c, (counts.get(c) ?? 0) + 1);
  const inferred = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const cuisine = input.meta.cuisine?.trim() || inferred;

  const servings = clampServings(input.servings ?? input.baseServings ?? 4);
  const factor = input.baseServings && input.servings ? servings / input.baseServings : 1;
  const specialty = matches.flatMap((m) => (m ? [m.ing] : []));
  const primary = choosePrimary(storesResult.stores, specialty);
  const picker = new StorePicker(storesResult.stores, primary, style);
  const ctx: ResolveCtx = { picker, priceFactor: Math.max(1, factor), factor, cuisine, swapPhrases: [], swapNotes: [] };

  const ingredients = parsed.map((p, i) => resolveParsed(p, matches[i], ctx));

  let steps: string[];
  const given = (input.steps ?? []).filter((x) => x.trim());
  if (given.length > 0) {
    steps = given.map((step) => {
      const n = ` ${stemText(step)} `;
      const notes = ctx.swapNotes.filter((x) => n.includes(` ${x.alias} `));
      if (notes.length === 0) return step;
      return `${step} (Swap: use ${notes.map((x) => `${x.phrase} for the ${x.original.toLowerCase()}`).join("; ")}.)`;
    });
  } else {
    steps = [
      "Shop the list below — every swap is matched to a store near you.",
      ...(ctx.swapNotes.length > 0
        ? ctx.swapNotes.map((x) => `When your recipe calls for ${x.original.toLowerCase()}, use ${x.phrase}${x.ratio ? ` (${x.ratio})` : ""}.`)
        : ["Great news — everything on your list is available near you, so cook it exactly as written."]),
      "Cook it the way your family always has. Substitutes can be milder or saltier than the originals, so taste and adjust the seasoning at the end.",
    ];
  }

  const swaps = ingredients.filter((i) => i.status === "swap").length;
  const finds = ingredients.filter((i) => i.status === "authentic_nearby").length;
  const finalCuisine = cuisine || "Home cooking";
  return finalizeRecipe({
    meta: {
      dishName: input.meta.dishName.trim() || "Family recipe",
      cuisine: finalCuisine,
      country: input.meta.country,
      flag: flagForCuisine(input.meta.country && !cuisine ? input.meta.country : finalCuisine),
      region: null,
      description:
        input.meta.description ??
        `Translated for ${storesResult.location.label}: ${swaps} smart swap${swaps === 1 ? "" : "s"} and ${finds} authentic find${finds === 1 ? "" : "s"} nearby.`,
      image: input.meta.image,
      servings,
      prepMinutes: input.meta.prepMinutes,
      cookMinutes: input.meta.cookMinutes,
      difficulty: input.meta.difficulty,
    },
    ingredients,
    steps,
    tips: smartTips(ingredients),
    swapPhrases: ctx.swapPhrases,
    storesResult,
    style,
    engine: "culturize",
    source: input.source,
  });
}

export function culturizePaste(
  input: { dishName: string; cuisine?: string; ingredientsText: string; stepsText?: string; servings?: number },
  storesResult: StoresResult,
  style: ShoppingStyle,
): CulturizedRecipe {
  return culturizeItems(
    {
      items: splitIngredientLines(input.ingredientsText).map((line) => ({ qty: null, name: line })),
      steps: input.stepsText ? splitSteps(input.stepsText) : null,
      meta: {
        dishName: input.dishName,
        cuisine: input.cuisine?.trim() || null,
        country: null,
        description: null,
        image: null,
        prepMinutes: 0,
        cookMinutes: 0,
        difficulty: "Family recipe",
      },
      baseServings: null,
      servings: input.servings,
      source: { kind: "paste", name: "Your family recipe", url: null },
    },
    storesResult,
    style,
  );
}

/** Culturize a recipe fetched from TheMealDB or a web page. */
export function culturizeRaw(raw: RawRecipe, storesResult: StoresResult, servings: number | undefined, style: ShoppingStyle): CulturizedRecipe {
  const total = (raw.prepMinutes ?? 0) + (raw.cookMinutes ?? 0);
  const difficulty = total >= 120 ? "Weekend project" : total >= 50 || raw.ingredients.length > 14 ? "Medium" : "Easy";
  return culturizeItems(
    {
      items: raw.ingredients,
      steps: raw.steps,
      meta: {
        dishName: raw.name,
        cuisine: raw.cuisine,
        country: raw.country,
        description: raw.description,
        image: raw.image,
        prepMinutes: raw.prepMinutes ?? 0,
        cookMinutes: raw.cookMinutes ?? 0,
        difficulty,
      },
      baseServings: raw.servings,
      servings,
      source: raw.source,
    },
    storesResult,
    style,
  );
}
