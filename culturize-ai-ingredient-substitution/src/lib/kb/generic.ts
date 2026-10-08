import type { BuyItem, StoreTag, Substitute } from "@/lib/types";
import { b, s, M } from "./helpers";
import { stemText, stemWord } from "./text";

/* ------------------------------------------------------------------ */
/* "Everyday" lexicon — if an ingredient mentions one of these words    */
/* (and nothing in the swap library matched), it's a normal US grocery  */
/* item and doesn't need a swap.                                        */
/* ------------------------------------------------------------------ */

const COMMON_RAW = `
chicken beef pork lamb turkey duck veal bacon ham sausage steak ribs brisket mince meatball hot dog venison goat oxtail liver
fish salmon tuna cod tilapia shrimp prawn crab lobster scallop mussel clam oyster squid calamari anchovy sardine haddock trout halibut catfish mackerel
egg milk cream butter cheese cheddar mozzarella parmesan feta ricotta yogurt yoghurt buttermilk margarine mascarpone gruyere swiss brie gouda provolone
onion garlic ginger shallot leek scallion chive tomato potato carrot celery cabbage lettuce spinach kale arugula broccoli cauliflower cucumber zucchini courgette squash pumpkin eggplant aubergine
pepper bell jalapeno capsicum corn pea bean lentil chickpea garbanzo mushroom asparagus beet beetroot radish turnip parsnip fennel artichoke okra avocado olive caper pickle sauerkraut
apple banana orange lemon lime grape strawberry blueberry raspberry cherry peach pear plum mango pineapple melon watermelon coconut cranberry raisin date fig apricot grapefruit berry fruit
rice pasta spaghetti penne macaroni noodle couscous quinoa oat oatmeal barley bulgur cornmeal polenta bread breadcrumb crouton tortilla pita naan bun roll bagel cracker cereal grits
flour sugar salt honey syrup molasses vanilla yeast baking cornstarch cocoa chocolate gelatin
oil vinegar mustard ketchup mayonnaise mayo soy sauce stock broth bouillon wine beer rum brandy sherry whiskey vodka
cumin coriander turmeric paprika cinnamon clove nutmeg allspice cardamom oregano thyme rosemary sage basil parsley cilantro mint dill tarragon marjoram bay chili chilli cayenne curry masala seasoning spice herb saffron
sesame sunflower pumpkin peanut almond cashew walnut pecan pistachio hazelnut macadamia pine nut
tofu tempeh miso sriracha hoisin tahini hummus salsa guacamole pesto marinara
water ice juice tea coffee soda lard shortening ghee
tamarind lemongrass galangal sambal oelek wasabi nori seaweed
chipotle adobo tomatillo plantain yam sweet cassava jicama
hot

hominy madras grain redcurrant blackcurrant jamon aioli mayonnaise meat codfish kabanos longan wonton nougat delight cassaba dessert cookie cake pie tart bar candy chocolates sprinkles
cacao cajun creole celeriac challot chorizo pudding biscuit cookie doner farfalle fries fry taco shell horseradish hotsauce lasagne lasagna meringue marshmallow parmigiano reggiano pastry rigatoni rocket stir sultana vinaigrette dressing pretzel popcorn caramel tagliatelle fettuccine fettucine linguine fideo vermicelli orzo gnocchi ravioli tortellini monkfish pilchard fromage frais passata sweetcorn fat chestnut vegetable baguette suet swede stout brussels sprout currant peel custard blackberry hazlenut hazelnut colouring coloring marzipan treacle bouquet garni prosciutto anise muffin tripe filo phyllo dough liqueur marnier mincemeat rhubarb gherkin relish kielbasa herring jam jelly marmalade cider ciabatta buckwheat prune falafel nutella barramundi hake bass roast toast pois pomegranate peppercorn rye starch semolina bamboo shoot pak bok choi choy savoury savory conch farine breadfruit trotter frog heart palm dulce leche gelatine gelatin potatoe avacado hass pulp
swiss chard collard watercress endive radicchio mizuna sorrel nettle thistle kohlrabi rutabaga salsify jerusalem cress sprouts chicory bean beans edamame lima fava broad cannellini pinto navy kidney borlotti
trout pike perch carp eel whitebait sprat smelt snapper grouper mahi swordfish tuna anchovies roe caviar surimi crayfish langoustine cockle whelk octopus cuttlefish
turkey goose quail pheasant rabbit hare partridge pigeon mutton gammon pancetta salami pepperoni mortadella bresaola capicola chuck sirloin tenderloin loin shank shoulder rump flank mince patty burger
cheddar edam emmental camembert stilton roquefort gorgonzola halloumi paneer cottage cream cheese quark kefir ghee whey curd
apricot nectarine quince persimmon guava papaya kiwi lychee passionfruit tangerine clementine mandarin satsuma kumquat damson greengage mulberry gooseberry elderberry loganberry tangelo pomelo
muesli granola cornflake cornflour cornmeal arrowroot bicarbonate bicarb soda yeast sourdough brioche croissant focaccia pitta tortilla wrap flatbread chapati roti poppadom pappadum crouton breadcrumb panko
allspice caraway juniper nigella poppy khus mustard fenugreek turmeric asafoetida saffron vanilla cardamon cardamom clove chilli sumac paprika pimenton
treacle golden syrup agave stevia sweetener icing frosting sprinkle fondant glucose
ketchup brown hp worcestershire tabasco piccalilli chutney pickle capers mayo salad cream tartare
ale lager port madeira marsala vermouth champagne prosecco liqueur amaretto kahlua baileys whisky gin tequila
`;

export const COMMON_WORDS = new Set(COMMON_RAW.split(/\s+/).filter(Boolean).map(stemWord));

/** Words that mean "special" even when the name also contains an everyday word. */
const SPECIAL_MARKERS = /\b(fermented|smoked dried|dried fish|bush|banana leaf|leaves of|pandan|culantro|epazote|annatto|achiote)\b/;

export function looksCommon(name: string): boolean {
  const stem = stemText(name);
  if (!stem || SPECIAL_MARKERS.test(stem)) return false;
  return stem.split(" ").some((t) => COMMON_WORDS.has(t));
}

/* ------------------------------------------------------------------ */
/* Generic substitution families for ingredients not in the library     */
/* ------------------------------------------------------------------ */

export interface GenericRule {
  id: string;
  /** Skip this family when the name already reads like an everyday ingredient. */
  skipIfCommon?: boolean;
  pattern: RegExp;
  category: "Spice & Seasoning" | "Produce" | "Pantry" | "Sauce & Paste" | "Protein" | "Grain & Flour";
  authentic: BuyItem;
  tags: StoreTag[];
  substitutes: Substitute[];
}

export const GENERIC_RULES: GenericRule[] = [
  {
    id: "dried-chile",
    pattern: /\bdried (?!red\b|green\b|hot\b|whole\b|crushed\b|chili\b|chile\b)\w+ (?:chil(?:i|e|li)e?s?|peppers?)\b|\b(cascabel|chilhuacle|puya|pequin|piquin|morita|costeno|japones|hatch)\b/,
    category: "Spice & Seasoning",
    authentic: b("Dried chiles", "International", 3.49),
    tags: ["latin", "asian", "international"],
    substitutes: [
      s("Crushed red pepper + sweet paprika", "crushed red pepper with a little sweet paprika", 62, M, [b("Crushed red pepper flakes", "Spices", 2.49), b("Sweet paprika", "Spices", 2.99)], "½ tsp flakes + ½ tsp paprika per chile", "Matches the heat and red color; the exact fruity-smoky note will differ by chile."),
    ],
  },
  {
    id: "spice-blend",
    pattern: /\b(?!garam\b)\w+ masala\b|\bspice (?:mix|blend)\b/,
    category: "Spice & Seasoning",
    authentic: b("Specialty spice blend", "International", 3.99),
    tags: ["indian", "international"],
    substitutes: [
      s("Garam masala + cumin + paprika", "garam masala with a little cumin and paprika", 65, M, [b("Garam masala", "Spices", 4.49), b("Ground cumin", "Spices", 2.99), b("Sweet paprika", "Spices", 2.99)], "1 tsp garam masala + ½ tsp each cumin & paprika per tsp of blend", "A warm, rounded blend that stands in for most regional masalas — adjust heat to taste."),
    ],
  },
  {
    id: "fresh-turmeric",
    pattern: /\bfresh\b.*\b(turmeric|haldi)\b|\b(turmeric|haldi) root\b/,
    category: "Produce",
    authentic: b("Fresh turmeric root", "Produce", 3.99),
    tags: ["asian", "indian", "natural"],
    substitutes: [
      s("Ground turmeric", "ground turmeric", 85, M, [b("Ground turmeric", "Spices", 2.99)], "1 tsp ground per 1-inch fresh root", "Same earthy color and flavor, a little less bright."),
    ],
  },
  {
    id: "glass-noodles",
    pattern: /\b(glass|cellophane|bean thread|sweet potato|japchae|dangmyeon) noodles?\b|\bfunsen\b|\bsai fun\b/,
    category: "Grain & Flour",
    authentic: b("Glass noodles", "International", 2.99),
    tags: ["asian", "international"],
    substitutes: [
      s("Thin rice vermicelli or angel hair", "angel hair pasta", 55, M, [b("Angel hair pasta", "Pasta", 1.49)], "Cook 1 minute short of the package time", "Not as bouncy, but similarly thin and slippery."),
    ],
  },
  {
    id: "dried-fancy-mushroom",
    pattern: /\bdried\b.*\b(porcini|morel|chanterelle|matsutake|shiitake|funghi)\b|\b(porcini|morel|chanterelle|matsutake)s?\b/,
    category: "Produce",
    authentic: b("Dried specialty mushrooms", "International", 5.99),
    tags: ["international", "natural", "european", "asian"],
    substitutes: [
      s("Cremini mushrooms + a splash of soy", "sliced cremini mushrooms with a splash of soy sauce", 68, M, [b("Cremini mushrooms", "Produce", 2.99), b("Soy sauce", "International", 2.99)], "1:1 by weight, browned hard", "Browning builds back the deep umami of dried mushrooms."),
    ],
  },
  {
    id: "fermented-fish-sauce",
    pattern: /\b(fish|shrimp|crab|anchovy) (paste|sauce|powder)\b(?!.*oyster)/,
    category: "Sauce & Paste",
    authentic: b("Fermented seafood paste", "International", 3.99),
    tags: ["asian", "international"],
    substitutes: [
      s("Anchovy paste", "anchovy paste", 70, M, [b("Anchovy paste (tube)", "Canned Goods", 3.29)], "½ tsp per tsp, to taste", "Concentrated, salty and savory in the same way."),
    ],
  },
  {
    id: "specialty-flour",
    pattern: /\b(?:cassava|sorghum|teff|millet|fonio|lentil|banana|sweet rice|glutinous rice|water chestnut|lotus) (?:root )?flour\b/,
    category: "Grain & Flour",
    authentic: b("Specialty flour", "Baking", 5.99),
    tags: ["natural", "international"],
    substitutes: [
      s("All-purpose flour", "all-purpose flour", 58, M, [b("All-purpose flour", "Baking", 2.99)], "Start 1:1 and adjust the liquid", "Works structurally, though flavor and gluten behavior differ."),
    ],
  },
];

export function matchGeneric(name: string): GenericRule | null {
  const n = ` ${stemText(name)} `.trim();
  // Patterns are written against un-stemmed text; test both forms.
  const raw = name.toLowerCase();
  const common = looksCommon(name);
  return GENERIC_RULES.find((r) => !(r.skipIfCommon && common) && (r.pattern.test(raw) || r.pattern.test(n))) ?? null;
}

/* ------------------------------------------------------------------ */
/* Which kind of specialty store likely carries a cuisine's staples     */
/* ------------------------------------------------------------------ */

const CUISINE_TAGS: [RegExp, StoreTag[]][] = [
  [/korean|chinese|japanese|thai|vietnam|filipin|indonesia|malaysia|cambodia|lao|taiwan|asian|burmese|singapor|mongol|sichuan|cantonese/i, ["asian"]],
  [/india|pakistan|bangladesh|sri lanka|nepal|punjab|bengali|gujarat|tamil|south asia/i, ["indian"]],
  [/mexic|salvador|guatemal|hondur|nicaragua|costa rica|panama|colombia|venezuel|peru|ecuador|bolivia|chile|argentin|uruguay|paraguay|brazil|cuban|dominican|puerto|latin/i, ["latin_specialty", "latin"]],
  [/nigeria|ghana|senegal|cameroon|ethiopia|eritrea|somali|kenya|tanzania|uganda|liberia|sierra leone|ivor|congo|south africa|zimbabwe|african|jamaic|trinidad|haiti|guyana|barbad|bahamas|caribbean|west indian/i, ["african_caribbean"]],
  [/persia|iran|iraq|leban|syria|jordan|palestin|israel|turk|egypt|moroccan|morocco|tunisia|algeria|libya|saudi|yemen|emirat|kuwait|qatar|arab|afghan|armenia|middle east/i, ["middle_eastern"]],
  [/polish|poland|russia|ukrain|german|hungar|czech|slovak|serbia|croatia|bosnia|bulgaria|romania|georgia|lithuan|latvia|estonia|finn|swed|norweg|danish|dutch|belgian|swiss|austria|greek|ital|portug|spanish|spain|french|irish|british|scottish|welsh|european/i, ["european"]],
];

export function cuisineStoreTags(cuisine: string | null | undefined): StoreTag[] {
  if (!cuisine) return ["international"];
  const hit = CUISINE_TAGS.find(([re]) => re.test(cuisine));
  return hit ? hit[1] : ["international"];
}
