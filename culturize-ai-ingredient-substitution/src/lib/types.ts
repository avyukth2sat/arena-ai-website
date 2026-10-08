/** Capability tags describing what kind of products a store typically stocks. */
export type StoreTag =
  | "mainstream"
  | "international"
  | "latin"
  | "latin_specialty"
  | "asian"
  | "indian"
  | "middle_eastern"
  | "african_caribbean"
  | "european"
  | "natural"
  | "warehouse";

export type StoreKind =
  | "supermarket"
  | "big_box"
  | "natural"
  | "warehouse"
  | "asian_market"
  | "latin_market"
  | "indian_market"
  | "middle_eastern_market"
  | "african_caribbean_market"
  | "european_market"
  | "international_market";

export interface StoreInfo {
  id: string;
  name: string;
  chain: string | null;
  kind: StoreKind;
  tags: StoreTag[];
  distanceMi: number | null;
  address: string | null;
  source: "osm" | "regional";
}

export interface LocationInfo {
  zip: string | null;
  label: string;
  lat: number | null;
  lon: number | null;
}

export interface StoresResult {
  location: LocationInfo;
  stores: StoreInfo[];
  source: "osm" | "regional";
  note: string | null;
}

export interface BuyItem {
  product: string;
  aisle: string;
  price: number;
}

/**
 * easy             – a normal grocery item, available at mainstream stores
 * authentic_nearby – a specialty item we found authentically at a nearby store
 * swap             – a hard-to-find item replaced with a local substitute
 * pantry           – a staple you most likely already have
 */
export type IngredientStatus = "easy" | "authentic_nearby" | "swap" | "pantry" | "specialty";

/** Where a culturized recipe came from. */
export interface RecipeSource {
  kind: "library" | "themealdb" | "web" | "paste" | "ai";
  name: string;
  url: string | null;
}

/** A recipe pulled from outside the built-in library, before culturizing. */
export interface RawRecipe {
  name: string;
  cuisine: string | null;
  country: string | null;
  description: string | null;
  image: string | null;
  servings: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  /** qty === null means `name` is a whole free-text line ("2 tbsp olive oil, divided"). */
  ingredients: { qty: string | null; name: string }[];
  steps: string[];
  source: RecipeSource;
}

export interface StoreRef {
  id: string;
  name: string;
  distanceMi: number | null;
  kind: StoreKind;
}

export interface RecipeIngredient {
  original: string;
  quantity: string;
  status: IngredientStatus;
  use: string;
  buy: BuyItem[];
  ratio: string | null;
  store: StoreRef | null;
  match: number;
  why: string | null;
  alternatives: { name: string; match: number; storeName: string | null }[];
  authenticWhere: string | null;
}

export interface ShoppingItem {
  product: string;
  aisle: string;
  price: number;
  forIngredient: string;
}

export interface ShoppingGroup {
  store: StoreRef | null;
  items: ShoppingItem[];
  subtotal: number;
}

export type ShoppingStyle = "authentic" | "one-stop";

export interface CulturizedRecipe {
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
  authenticity: number;
  swapCount: number;
  authenticFoundCount: number;
  style: ShoppingStyle;
  location: LocationInfo;
  stores: StoreInfo[];
  storeSource: "osm" | "regional";
  ingredients: RecipeIngredient[];
  shopping: ShoppingGroup[];
  shoppingTotal: number;
  steps: string[];
  tips: string[];
  /** Phrases inserted into the steps for swapped ingredients (highlighted in the UI). */
  swapPhrases: string[];
  /** Specialty ingredients without a tested swap (older saved recipes won't have this). */
  unverifiedCount?: number;
  source?: RecipeSource;
  engine: "culturize" | "openai";
  generatedAt: string;
}

export interface CulturizeRequest {
  mode: "dish" | "paste";
  dish: string;
  cuisine?: string;
  ingredientsText?: string;
  stepsText?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  servings?: number;
  style?: ShoppingStyle;
}

export interface DishSummary {
  id: string;
  name: string;
  cuisine: string;
  country: string;
  region: string;
  flag: string;
  image: string | null;
  description: string;
  difficulty: string;
  totalMinutes: number;
  specialtyCount: number;
}

export type CulturizeResponse =
  | { ok: true; recipe: CulturizedRecipe }
  | { ok: false; error: string; suggestions?: DishSummary[] };

/* ---------- Knowledge-base types ---------- */

export interface Substitute {
  name: string;
  /** lowercase phrase that reads naturally inside a recipe step */
  short: string;
  match: number;
  foundAt: StoreTag[];
  buy: BuyItem[];
  ratio: string;
  why: string;
}

export type IngredientCategory =
  | "Spice & Seasoning"
  | "Fresh Herb"
  | "Produce"
  | "Protein"
  | "Pantry"
  | "Dairy"
  | "Grain & Flour"
  | "Sauce & Paste";

export interface SpecialtyIngredient {
  id: string;
  name: string;
  short: string;
  aliases: string[];
  cuisines: string[];
  category: IngredientCategory;
  /** Plain-language description for ingredient search; encyclopedia data fills gaps. */
  description?: string;
  foundAt: StoreTag[];
  authentic: BuyItem;
  substitutes: Substitute[];
}

export interface EncyclopediaEntry {
  title: string;
  extract: string;
  image: string | null;
  url: string;
}

export interface IngredientSearchResult {
  query: string;
  name: string;
  kind: "library" | "generic" | "common" | "encyclopedia" | "unknown";
  category: string | null;
  cuisines: string[];
  where: string | null;
  description: string | null;
  image: string | null;
  articleUrl: string | null;
  articleTitle: string | null;
  substitutes: {
    name: string;
    match: number;
    ratio: string;
    why: string;
    foundLabel: string;
  }[];
}

export interface MissingIngredientResult {
  ok: true;
  dish: string;
  ingredient: RecipeIngredient;
  knowledge: IngredientSearchResult;
  location: LocationInfo;
  stores: StoreInfo[];
}

export type MissingIngredientResponse =
  | MissingIngredientResult
  | { ok: false; error: string };

export type DishIngredient =
  | { kind: "kb"; ref: string; qty: string }
  | { kind: "common"; name: string; qty: string; aisle: string; price: number }
  | { kind: "pantry"; name: string; qty: string };

export interface DishTemplate {
  id: string;
  name: string;
  aliases: string[];
  cuisine: string;
  country: string;
  region: string;
  flag: string;
  image: string | null;
  description: string;
  servings: number;
  prep: number;
  cook: number;
  difficulty: "Easy" | "Medium" | "Weekend project";
  ingredients: DishIngredient[];
  steps: string[];
  tips: string[];
}
