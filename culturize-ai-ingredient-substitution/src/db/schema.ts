import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { CulturizedRecipe } from "@/lib/types";

/** Recipes users saved to the Culturize community cookbook. */
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  dishName: text("dish_name").notNull(),
  cuisine: text("cuisine").notNull(),
  country: text("country"),
  flag: text("flag"),
  authenticity: integer("authenticity").notNull(),
  swapCount: integer("swap_count").default(0).notNull(),
  locationLabel: text("location_label"),
  zip: text("zip"),
  engine: text("engine").notNull(),
  data: jsonb("data").$type<CulturizedRecipe>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Every culturize request — powers "trending" and "most requested" insights. */
export const searchLogs = pgTable("search_logs", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  mode: text("mode").notNull(),
  cuisine: text("cuisine"),
  zip: text("zip"),
  found: boolean("found").default(true).notNull(),
  engine: text("engine"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type RecipeRow = typeof recipes.$inferSelect;
