import type {
  BuyItem,
  DishIngredient,
  IngredientCategory,
  SpecialtyIngredient,
  StoreTag,
  Substitute,
} from "@/lib/types";

/* Store-tag shorthands */
export const M: StoreTag[] = ["mainstream"];
export const INTL: StoreTag[] = ["international"];
export const NAT: StoreTag[] = ["natural"];
export const ASIAN: StoreTag[] = ["asian"];
export const LATIN: StoreTag[] = ["latin"];
export const LATSPEC: StoreTag[] = ["latin_specialty"];
export const INDIAN: StoreTag[] = ["indian"];
export const MIDEAST: StoreTag[] = ["middle_eastern"];
export const AFCAR: StoreTag[] = ["african_caribbean"];
export const EURO: StoreTag[] = ["european"];

/** A product to buy. */
export const b = (product: string, aisle: string, price: number): BuyItem => ({ product, aisle, price });

/** A substitute option. */
export const s = (
  name: string,
  short: string,
  match: number,
  foundAt: StoreTag[],
  buy: BuyItem[],
  ratio: string,
  why: string,
): Substitute => ({ name, short, match, foundAt, buy, ratio, why });

/** A hard-to-find specialty ingredient. */
export const ing = (
  id: string,
  name: string,
  short: string,
  aliases: string[],
  cuisines: string[],
  category: IngredientCategory,
  foundAt: StoreTag[],
  authentic: BuyItem,
  substitutes: Substitute[],
  description?: string,
): SpecialtyIngredient => ({ id, name, short, aliases, cuisines, category, foundAt, authentic, substitutes, description });

/* Dish-ingredient shorthands */
export const k = (ref: string, qty: string): DishIngredient => ({ kind: "kb", ref, qty });
export const c = (name: string, qty: string, aisle: string, price: number): DishIngredient => ({
  kind: "common",
  name,
  qty,
  aisle,
  price,
});
export const p = (name: string, qty: string): DishIngredient => ({ kind: "pantry", name, qty });
