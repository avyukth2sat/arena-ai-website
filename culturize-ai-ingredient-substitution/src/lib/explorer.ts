import type { ExplorerItem } from "@/components/SubstituteExplorer";
import { whereToFind } from "@/lib/engine";
import { availabilityLabel } from "@/lib/kb/stores";
import type { SpecialtyIngredient } from "@/lib/types";

const REGION_OF: Record<string, string> = {
  Nigerian: "Africa", Ghanaian: "Africa", Senegalese: "Africa", Cameroonian: "Africa", Ethiopian: "Africa", Eritrean: "Africa",
  Jamaican: "Caribbean", Trinidadian: "Caribbean", Guyanese: "Caribbean", Haitian: "Caribbean", Cuban: "Caribbean",
  "Puerto Rican": "Caribbean", Dominican: "Caribbean", Caribbean: "Caribbean",
  Mexican: "Latin America", Yucatecan: "Latin America", Salvadoran: "Latin America", Guatemalan: "Latin America",
  Venezuelan: "Latin America", Colombian: "Latin America", Peruvian: "Latin America", Brazilian: "Latin America",
  Korean: "East Asia", Chinese: "East Asia", Sichuan: "East Asia", Japanese: "East Asia", Hawaiian: "East Asia",
  Thai: "Southeast Asia", Vietnamese: "Southeast Asia", Filipino: "Southeast Asia", Indonesian: "Southeast Asia",
  Malaysian: "Southeast Asia", Lao: "Southeast Asia", Cambodian: "Southeast Asia",
  Indian: "South Asia", Pakistani: "South Asia", Bangladeshi: "South Asia", "Sri Lankan": "South Asia",
  Persian: "Middle East & N. Africa", Lebanese: "Middle East & N. Africa", Jordanian: "Middle East & N. Africa",
  Palestinian: "Middle East & N. Africa", Syrian: "Middle East & N. Africa", Iraqi: "Middle East & N. Africa",
  "Gulf Arab": "Middle East & N. Africa", Turkish: "Middle East & N. Africa", Armenian: "Middle East & N. Africa",
  Moroccan: "Middle East & N. Africa", Tunisian: "Middle East & N. Africa", Algerian: "Middle East & N. Africa",
  Polish: "Europe", Ukrainian: "Europe", Russian: "Europe", German: "Europe", Georgian: "Europe",
  Portuguese: "Europe", Spanish: "Europe", Italian: "Europe", French: "Europe", Greek: "Europe", Swedish: "Europe",
  Hungarian: "Europe", Serbian: "Europe", Bosnian: "Europe", Macedonian: "Europe",
  Congolese: "Africa", Liberian: "Africa", "Sierra Leonean": "Africa", Ivorian: "Africa", Mozambican: "Africa", Angolan: "Africa",
  Egyptian: "Middle East & N. Africa", Israeli: "Middle East & N. Africa",
  Nepali: "South Asia", Cantonese: "East Asia", Taiwanese: "East Asia",
};

export function toExplorerItem(ing: SpecialtyIngredient): ExplorerItem {
  return {
    id: ing.id,
    name: ing.name,
    short: ing.short,
    aliases: ing.aliases,
    cuisines: ing.cuisines,
    category: ing.category,
    description: ing.description,
    where: whereToFind(ing.foundAt),
    regions: [...new Set(ing.cuisines.map((c) => REGION_OF[c]).filter(Boolean))],
    substitutes: ing.substitutes.map((s) => ({
      name: s.name,
      match: s.match,
      ratio: s.ratio,
      why: s.why,
      foundLabel: availabilityLabel(s.foundAt),
    })),
  };
}
