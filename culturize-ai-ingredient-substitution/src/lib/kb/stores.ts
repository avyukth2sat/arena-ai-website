import type { StoreKind, StoreTag } from "@/lib/types";

export interface Chain {
  id: string;
  name: string;
  patterns: RegExp[];
  kind: StoreKind;
  tags: StoreTag[];
}

const MAIN: StoreTag[] = ["mainstream", "international"];

/** Grocery chains in the US and the kind of inventory they typically carry. */
export const CHAINS: Chain[] = [
  // Specialty / international chains first so they win over generic patterns.
  { id: "hmart", name: "H Mart", patterns: [/\bh[\s-]?mart\b/], kind: "asian_market", tags: ["asian", "international", "mainstream"] },
  { id: "ranch99", name: "99 Ranch Market", patterns: [/99 ranch/], kind: "asian_market", tags: ["asian", "international"] },
  { id: "uwajimaya", name: "Uwajimaya", patterns: [/uwajimaya/], kind: "asian_market", tags: ["asian", "international", "mainstream"] },
  { id: "mitsuwa", name: "Mitsuwa Marketplace", patterns: [/mitsuwa/], kind: "asian_market", tags: ["asian"] },
  { id: "seafoodcity", name: "Seafood City", patterns: [/seafood city/], kind: "asian_market", tags: ["asian"] },
  { id: "lotte", name: "Lotte Plaza Market", patterns: [/lotte/], kind: "asian_market", tags: ["asian", "latin", "international"] },
  { id: "patel", name: "Patel Brothers", patterns: [/patel/], kind: "indian_market", tags: ["indian"] },
  { id: "fiesta", name: "Fiesta Mart", patterns: [/fiesta mart/, /^fiesta$/], kind: "latin_market", tags: ["latin", "latin_specialty", "african_caribbean", "international", "mainstream"] },
  { id: "vallarta", name: "Vallarta Supermarkets", patterns: [/vallarta/], kind: "latin_market", tags: ["latin", "latin_specialty", "mainstream"] },
  { id: "northgate", name: "Northgate Market", patterns: [/northgate/], kind: "latin_market", tags: ["latin", "latin_specialty", "mainstream"] },
  { id: "cardenas", name: "Cardenas Markets", patterns: [/cardenas/], kind: "latin_market", tags: ["latin", "latin_specialty", "mainstream"] },
  { id: "elsuper", name: "El Super", patterns: [/\bel super\b/], kind: "latin_market", tags: ["latin", "latin_specialty", "mainstream"] },
  { id: "sedanos", name: "Sedano's", patterns: [/sedano/], kind: "latin_market", tags: ["latin", "latin_specialty", "african_caribbean", "mainstream"] },
  { id: "presidente", name: "Presidente Supermarket", patterns: [/presidente/], kind: "latin_market", tags: ["latin", "latin_specialty", "african_caribbean", "mainstream"] },
  { id: "foodcity", name: "Food City", patterns: [/^food city/], kind: "latin_market", tags: ["latin", "latin_specialty", "mainstream"] },
  // Natural & specialty supermarkets
  { id: "wholefoods", name: "Whole Foods Market", patterns: [/whole foods/], kind: "natural", tags: ["mainstream", "natural", "international"] },
  { id: "traderjoes", name: "Trader Joe's", patterns: [/trader joe/], kind: "natural", tags: ["mainstream", "natural"] },
  { id: "sprouts", name: "Sprouts Farmers Market", patterns: [/sprouts/], kind: "natural", tags: ["mainstream", "natural"] },
  { id: "naturalgrocers", name: "Natural Grocers", patterns: [/natural grocers/], kind: "natural", tags: ["natural"] },
  { id: "freshmarket", name: "The Fresh Market", patterns: [/fresh market/], kind: "natural", tags: ["mainstream", "natural"] },
  { id: "centralmarket", name: "Central Market", patterns: [/central market/], kind: "natural", tags: ["mainstream", "natural", "international", "latin"] },
  // Warehouse clubs & big box
  { id: "costco", name: "Costco", patterns: [/costco/], kind: "warehouse", tags: ["mainstream", "warehouse", "international"] },
  { id: "samsclub", name: "Sam's Club", patterns: [/sam'?s club/], kind: "warehouse", tags: ["mainstream", "warehouse"] },
  { id: "walmart", name: "Walmart", patterns: [/walmart/, /wal-mart/], kind: "big_box", tags: ["mainstream", "international", "latin"] },
  { id: "target", name: "Target", patterns: [/^target\b/, /\btarget$/], kind: "big_box", tags: MAIN },
  { id: "meijer", name: "Meijer", patterns: [/meijer/], kind: "big_box", tags: ["mainstream", "international", "latin"] },
  // Kroger family
  { id: "ralphs", name: "Ralphs", patterns: [/ralphs/], kind: "supermarket", tags: ["mainstream", "international", "latin", "natural"] },
  { id: "fredmeyer", name: "Fred Meyer", patterns: [/fred meyer/], kind: "supermarket", tags: ["mainstream", "international", "natural"] },
  { id: "kingsoopers", name: "King Soopers", patterns: [/king soopers/], kind: "supermarket", tags: ["mainstream", "international", "latin"] },
  { id: "smiths", name: "Smith's", patterns: [/smith'?s food/, /^smith'?s$/], kind: "supermarket", tags: MAIN },
  { id: "frys", name: "Fry's Food", patterns: [/fry'?s/], kind: "supermarket", tags: ["mainstream", "international", "latin"] },
  { id: "qfc", name: "QFC", patterns: [/\bqfc\b/, /quality food cent/], kind: "supermarket", tags: ["mainstream", "international", "natural"] },
  { id: "harristeeter", name: "Harris Teeter", patterns: [/harris teeter/], kind: "supermarket", tags: ["mainstream", "international", "natural"] },
  { id: "dillons", name: "Dillons", patterns: [/dillons/], kind: "supermarket", tags: MAIN },
  { id: "marianos", name: "Mariano's", patterns: [/mariano/], kind: "supermarket", tags: ["mainstream", "international", "natural"] },
  { id: "food4less", name: "Food 4 Less", patterns: [/food ?4 ?less/], kind: "supermarket", tags: ["mainstream", "latin"] },
  { id: "kroger", name: "Kroger", patterns: [/kroger/], kind: "supermarket", tags: ["mainstream", "international", "natural"] },
  // Albertsons family
  { id: "safeway", name: "Safeway", patterns: [/safeway/], kind: "supermarket", tags: ["mainstream", "international", "natural"] },
  { id: "vons", name: "Vons", patterns: [/\bvons\b/], kind: "supermarket", tags: ["mainstream", "international", "latin"] },
  { id: "jewel", name: "Jewel-Osco", patterns: [/jewel/], kind: "supermarket", tags: MAIN },
  { id: "acme", name: "ACME Markets", patterns: [/\bacme\b/], kind: "supermarket", tags: MAIN },
  { id: "shaws", name: "Shaw's", patterns: [/shaw'?s/], kind: "supermarket", tags: MAIN },
  { id: "tomthumb", name: "Tom Thumb", patterns: [/tom thumb/], kind: "supermarket", tags: ["mainstream", "international", "latin"] },
  { id: "albertsons", name: "Albertsons", patterns: [/albertsons/], kind: "supermarket", tags: MAIN },
  // Regional supermarkets
  { id: "heb", name: "H-E-B", patterns: [/\bh-?e-?b\b/], kind: "supermarket", tags: ["mainstream", "international", "latin", "natural"] },
  { id: "publix", name: "Publix", patterns: [/publix/], kind: "supermarket", tags: MAIN },
  { id: "wegmans", name: "Wegmans", patterns: [/wegmans/], kind: "supermarket", tags: ["mainstream", "international", "natural"] },
  { id: "hyvee", name: "Hy-Vee", patterns: [/hy-?vee/], kind: "supermarket", tags: MAIN },
  { id: "stopandshop", name: "Stop & Shop", patterns: [/stop ?(&|and) ?shop/], kind: "supermarket", tags: MAIN },
  { id: "giant_eagle", name: "Giant Eagle", patterns: [/giant eagle/], kind: "supermarket", tags: MAIN },
  { id: "giant", name: "Giant", patterns: [/^giant\b/], kind: "supermarket", tags: MAIN },
  { id: "foodlion", name: "Food Lion", patterns: [/food lion/], kind: "supermarket", tags: ["mainstream"] },
  { id: "hannaford", name: "Hannaford", patterns: [/hannaford/], kind: "supermarket", tags: MAIN },
  { id: "shoprite", name: "ShopRite", patterns: [/shop ?rite/], kind: "supermarket", tags: ["mainstream", "international", "latin"] },
  { id: "winco", name: "WinCo Foods", patterns: [/winco/], kind: "supermarket", tags: ["mainstream", "latin"] },
  { id: "winndixie", name: "Winn-Dixie", patterns: [/winn-?dixie/], kind: "supermarket", tags: MAIN },
  { id: "marketbasket", name: "Market Basket", patterns: [/market basket/], kind: "supermarket", tags: MAIN },
  { id: "schnucks", name: "Schnucks", patterns: [/schnuck/], kind: "supermarket", tags: MAIN },
  { id: "cub", name: "Cub Foods", patterns: [/\bcub\b/], kind: "supermarket", tags: MAIN },
  { id: "staterbros", name: "Stater Bros.", patterns: [/stater bro/], kind: "supermarket", tags: ["mainstream", "latin"] },
  { id: "smartfinal", name: "Smart & Final", patterns: [/smart ?(&|and) ?final/], kind: "warehouse", tags: ["mainstream", "latin"] },
  { id: "aldi", name: "ALDI", patterns: [/\baldi\b/], kind: "supermarket", tags: ["mainstream"] },
  { id: "lidl", name: "Lidl", patterns: [/\blidl\b/], kind: "supermarket", tags: ["mainstream", "european"] },
];

export const CHAIN_BY_ID: Record<string, Chain> = Object.fromEntries(CHAINS.map((c) => [c.id, c]));

/** Keyword rules for independent markets found on OpenStreetMap. Order matters. */
export const KEYWORD_RULES: { kind: StoreKind; tags: StoreTag[]; pattern: RegExp }[] = [
  {
    kind: "international_market",
    tags: ["international", "latin", "latin_specialty", "asian", "middle_eastern", "african_caribbean", "mainstream"],
    pattern: /\b(international|world market|world foods?|global (foods?|market))\b/,
  },
  {
    kind: "indian_market",
    tags: ["indian"],
    pattern:
      /\b(india|indian|desi|bazaa?r|masala|apna|subzi|bombay|mumbai|punjab|delhi|bengal|bangla|pakistan|karachi|lahore|nepal|sri lanka|swadesh|namaste|taj)\b/,
  },
  {
    kind: "asian_market",
    tags: ["asian"],
    pattern:
      /\b(asian|asia|oriental|seoul|korea|korean|tokyo|japan|japanese|nippon|china|chinese|viet|vietnam|saigon|thai|bangkok|manila|filipino|pinoy|hong kong|mekong|great wall|kam man|nijiya|marukai|tokai|zion market|assi|galleria|lao|cambodia|taiwan|szechuan|sichuan)\b/,
  },
  {
    kind: "middle_eastern_market",
    tags: ["middle_eastern"],
    pattern:
      /\b(halal|middle east(ern)?|mediterranean|arab|arabic|persian|iran|turkish|lebanese|sahara|jerusalem|baghdad|damascus|kabul|afghan|sultan|aladdin|ararat|armenian|nazareth|zaytoon|levant|kabob|kebab)\b/,
  },
  {
    kind: "african_caribbean_market",
    tags: ["african_caribbean"],
    pattern:
      /\b(african|africa|caribbean|jamaica|jamaican|west indian|nigeria|nigerian|ghana|ghanaian|ethiopia|ethiopian|eritrea|somali|kenya|haiti|haitian|trini|trinidad|guyana|guyanese|tropical|afro|naija|senegal|liberia|cameroon)\b/,
  },
  {
    kind: "latin_market",
    tags: ["latin", "latin_specialty"],
    pattern:
      /(^(la|el|los|las)\s)|\b(mercado|carniceria|carnicería|tienda|latino|latina|latin|mexican|mexicana|supermercado|bodega|michoacana|hispan\w*|guatemal\w*|salvador\w*|hondur\w*|colombia\w*|peru\w*|brazil\w*|brasil\w*|dominican|cuban|panaderia|rancho)\b/,
  },
  {
    kind: "european_market",
    tags: ["european"],
    pattern: /\b(polish|polski|euro|european|russian|ukrain\w*|german|italian|italia|greek|balkan|serbian|bosnian|romanian|bulgarian|lithuanian|georgian)\b/,
  },
];

export const KIND_META: Record<StoreKind, { label: string; icon: string; tone: string }> = {
  supermarket: { label: "Supermarket", icon: "🛒", tone: "bg-stone-100 text-stone-700 ring-stone-200" },
  big_box: { label: "Supercenter", icon: "🏬", tone: "bg-sky-50 text-sky-800 ring-sky-200" },
  natural: { label: "Natural grocer", icon: "🌿", tone: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  warehouse: { label: "Warehouse club", icon: "📦", tone: "bg-slate-100 text-slate-700 ring-slate-200" },
  asian_market: { label: "Asian market", icon: "🥢", tone: "bg-rose-50 text-rose-800 ring-rose-200" },
  latin_market: { label: "Latin market", icon: "🌶️", tone: "bg-orange-50 text-orange-800 ring-orange-200" },
  indian_market: { label: "Indian grocery", icon: "🍛", tone: "bg-amber-50 text-amber-800 ring-amber-200" },
  middle_eastern_market: { label: "Middle Eastern market", icon: "🫒", tone: "bg-lime-50 text-lime-800 ring-lime-200" },
  african_caribbean_market: { label: "African & Caribbean market", icon: "🌍", tone: "bg-yellow-50 text-yellow-800 ring-yellow-200" },
  european_market: { label: "European deli", icon: "🥨", tone: "bg-indigo-50 text-indigo-800 ring-indigo-200" },
  international_market: { label: "International market", icon: "🌐", tone: "bg-violet-50 text-violet-800 ring-violet-200" },
};

/** Human-friendly description of where an authentic item can be found in the US. */
export const TAG_WHERE: Record<StoreTag, string> = {
  mainstream: "most supermarkets",
  international: "the international aisle at larger supermarkets",
  latin: "the Hispanic aisle at larger supermarkets",
  latin_specialty: "Latin & Caribbean markets (Fiesta, Sedano's, local tiendas)",
  asian: "Asian markets (H Mart, 99 Ranch, Uwajimaya)",
  indian: "Indian groceries (Patel Brothers & local desi stores)",
  middle_eastern: "Middle Eastern & halal markets",
  african_caribbean: "African & Caribbean markets",
  european: "Eastern European delis & markets",
  natural: "natural grocers (Whole Foods, Sprouts)",
  warehouse: "warehouse clubs (Costco, Sam's Club)",
};

/** Short availability labels for badges. */
export const SHORT_TAG: Record<StoreTag, string> = {
  mainstream: "Any supermarket",
  international: "International aisle",
  latin: "Hispanic aisle",
  latin_specialty: "Latin markets",
  asian: "Asian markets",
  indian: "Indian groceries",
  middle_eastern: "Middle Eastern markets",
  african_caribbean: "African & Caribbean markets",
  european: "European delis",
  natural: "Natural grocers",
  warehouse: "Warehouse clubs",
};

export function availabilityLabel(tags: StoreTag[]): string {
  if (tags.includes("mainstream")) return SHORT_TAG.mainstream;
  return tags
    .slice(0, 2)
    .map((t) => SHORT_TAG[t])
    .join(" · ");
}

/** Mainstream chains that are common in each region, keyed by ZIP prefix. */
const REGIONS: { from: number; to: number; label: string; chains: string[] }[] = [
  { from: 6, to: 9, label: "Puerto Rico", chains: ["walmart", "costco", "sedanos"] },
  { from: 10, to: 69, label: "New England", chains: ["stopandshop", "marketbasket", "hannaford", "shaws", "wholefoods", "traderjoes", "walmart"] },
  { from: 70, to: 89, label: "New Jersey", chains: ["shoprite", "stopandshop", "wegmans", "traderjoes", "wholefoods", "walmart", "aldi"] },
  { from: 100, to: 149, label: "New York", chains: ["shoprite", "stopandshop", "wegmans", "traderjoes", "wholefoods", "target", "aldi"] },
  { from: 150, to: 196, label: "Pennsylvania", chains: ["giant", "wegmans", "giant_eagle", "acme", "aldi", "traderjoes", "walmart"] },
  { from: 197, to: 268, label: "the Mid-Atlantic", chains: ["giant", "harristeeter", "safeway", "wegmans", "traderjoes", "walmart", "aldi"] },
  { from: 270, to: 299, label: "the Carolinas", chains: ["harristeeter", "foodlion", "publix", "walmart", "aldi", "traderjoes"] },
  { from: 300, to: 319, label: "Georgia", chains: ["publix", "kroger", "walmart", "aldi", "wholefoods", "traderjoes"] },
  { from: 320, to: 329, label: "Florida", chains: ["publix", "winndixie", "walmart", "aldi", "wholefoods", "traderjoes"] },
  { from: 330, to: 334, label: "South Florida", chains: ["publix", "sedanos", "presidente", "walmart", "wholefoods", "aldi"] },
  { from: 335, to: 349, label: "Florida", chains: ["publix", "winndixie", "walmart", "aldi", "wholefoods"] },
  { from: 350, to: 397, label: "the Southeast", chains: ["kroger", "publix", "walmart", "aldi", "winndixie"] },
  { from: 398, to: 399, label: "Georgia", chains: ["publix", "kroger", "walmart", "aldi"] },
  { from: 400, to: 499, label: "the Midwest", chains: ["kroger", "meijer", "walmart", "aldi", "giant_eagle", "wholefoods", "traderjoes"] },
  { from: 500, to: 599, label: "the Upper Midwest", chains: ["hyvee", "cub", "walmart", "aldi", "target", "costco"] },
  { from: 600, to: 629, label: "Illinois", chains: ["jewel", "marianos", "walmart", "aldi", "wholefoods", "traderjoes", "meijer"] },
  { from: 630, to: 699, label: "the Plains", chains: ["hyvee", "schnucks", "dillons", "walmart", "aldi", "target"] },
  { from: 700, to: 749, label: "the South", chains: ["walmart", "kroger", "albertsons", "winndixie", "aldi"] },
  { from: 750, to: 799, label: "Texas", chains: ["heb", "kroger", "walmart", "fiesta", "tomthumb", "aldi", "wholefoods"] },
  { from: 800, to: 816, label: "Colorado", chains: ["kingsoopers", "safeway", "walmart", "sprouts", "wholefoods", "traderjoes"] },
  { from: 820, to: 838, label: "the Mountain West", chains: ["albertsons", "walmart", "smiths", "winco"] },
  { from: 840, to: 847, label: "Utah", chains: ["smiths", "walmart", "costco", "winco", "traderjoes"] },
  { from: 850, to: 865, label: "Arizona", chains: ["frys", "safeway", "walmart", "sprouts", "foodcity", "traderjoes"] },
  { from: 870, to: 884, label: "New Mexico", chains: ["smiths", "albertsons", "walmart", "sprouts"] },
  { from: 885, to: 885, label: "West Texas", chains: ["heb", "walmart", "albertsons", "food4less"] },
  { from: 889, to: 898, label: "Nevada", chains: ["smiths", "albertsons", "walmart", "vons", "sprouts", "traderjoes"] },
  { from: 900, to: 935, label: "Southern California", chains: ["ralphs", "vons", "vallarta", "traderjoes", "wholefoods", "sprouts", "costco"] },
  { from: 936, to: 966, label: "Northern California", chains: ["safeway", "traderjoes", "wholefoods", "winco", "costco", "sprouts"] },
  { from: 967, to: 969, label: "Hawaii", chains: ["safeway", "costco", "walmart", "wholefoods"] },
  { from: 970, to: 979, label: "Oregon", chains: ["fredmeyer", "safeway", "winco", "traderjoes", "costco"] },
  { from: 980, to: 994, label: "Washington", chains: ["fredmeyer", "qfc", "safeway", "traderjoes", "costco", "winco"] },
  { from: 995, to: 999, label: "Alaska", chains: ["fredmeyer", "safeway", "walmart", "costco"] },
];

export function regionForZip(zip: string | null): { label: string; chains: string[] } {
  const prefix = zip ? parseInt(zip.slice(0, 3), 10) : NaN;
  const region = Number.isFinite(prefix) ? REGIONS.find((r) => prefix >= r.from && prefix <= r.to) : undefined;
  return region ?? { label: "your area", chains: ["walmart", "kroger", "target", "aldi", "wholefoods", "traderjoes"] };
}

export function classifyStore(
  name: string,
  brand: string | undefined,
  shop: string | undefined,
): { chain: Chain | null; kind: StoreKind; tags: StoreTag[] } | null {
  const hay = `${brand ?? ""} ${name}`.toLowerCase().trim();
  const nameLc = name.toLowerCase().trim();
  for (const chain of CHAINS) {
    if (chain.patterns.some((p) => p.test(nameLc) || (brand ? p.test(brand.toLowerCase()) : false))) {
      return { chain, kind: chain.kind, tags: chain.tags };
    }
  }
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(hay)) {
      return { chain: null, kind: rule.kind, tags: rule.tags };
    }
  }
  if (shop === "supermarket") {
    return { chain: null, kind: "supermarket", tags: ["mainstream"] };
  }
  return null;
}
