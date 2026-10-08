import type { SpecialtyIngredient } from "@/lib/types";
import { AFCAR, ASIAN, EURO, INDIAN, INTL, LATIN, LATSPEC, M, MIDEAST, NAT, b, ing, s } from "./helpers";

/** Second wave: more hard-to-find ingredients, grouped by region. */
export const MORE_INGREDIENTS: SpecialtyIngredient[] = [
  /* ---------------- Latin America ---------------- */
  ing("epazote", "Epazote", "epazote", ["epazote"], ["Mexican"], "Fresh Herb", LATSPEC, b("Fresh epazote", "Produce", 1.99), [
    s("Oregano + cilantro stems", "fresh oregano with a few cilantro stems", 70, M, [b("Fresh oregano", "Produce", 2.49), b("Cilantro", "Produce", 0.99)], "1 tsp oregano + 1 tbsp cilantro stems per sprig", "Epazote tastes herbal, citrusy and a bit medicinal — oregano plus cilantro stems gets close."),
  ]),
  ing("nopales", "Nopales (cactus paddles)", "nopales", ["nopales", "nopalitos", "cactus paddles", "prickly pear cactus"], ["Mexican"], "Produce", LATIN, b("Jarred nopalitos", "International", 3.49), [
    s("Green beans + lime juice", "green beans with a squeeze of lime", 62, M, [b("Fresh green beans", "Produce", 2.49), b("Limes", "Produce", 1.99)], "1:1, blanched, plus 1 tsp lime juice per cup", "Nopales are tender-crisp and tangy like green beans dressed with lime."),
  ]),
  ing("queso-fresco", "Queso fresco", "queso fresco", ["queso fresco", "fresh mexican cheese"], ["Mexican", "Salvadoran", "Colombian"], "Dairy", LATIN, b("Queso fresco", "Dairy", 3.99), [
    s("Rinsed feta", "mild feta, rinsed", 82, M, [b("Feta cheese", "Dairy", 3.99)], "1:1, crumbled — rinse to remove brine", "Crumbly, fresh and salty — rinsing tones the feta down to queso fresco."),
    s("Drained salted ricotta", "well-drained, salted whole-milk ricotta", 70, M, [b("Whole-milk ricotta", "Dairy", 4.29)], "1:1, drained 1 hour + a pinch of salt", "Milder and softer, but the same fresh-milk taste."),
  ]),
  ing("cotija", "Cotija cheese", "cotija", ["cotija", "queso cotija"], ["Mexican"], "Dairy", LATIN, b("Cotija cheese", "Dairy", 4.49), [
    s("Feta + Parmesan", "crumbled feta with a little Parmesan", 80, M, [b("Feta cheese", "Dairy", 3.99), b("Grated Parmesan", "Dairy", 4.49)], "3 parts feta : 1 part Parmesan", "Cotija is salty and dry-crumbly — feta gives the crumble, Parmesan the aged bite."),
  ]),
  ing("crema", "Crema Mexicana", "crema", ["crema mexicana", "mexican crema", "crema", "crema agria"], ["Mexican", "Salvadoran"], "Dairy", LATIN, b("Crema Mexicana", "Dairy", 3.49), [
    s("Sour cream thinned with cream", "sour cream thinned with a splash of heavy cream", 88, M, [b("Sour cream", "Dairy", 2.49), b("Heavy cream", "Dairy", 3.49)], "¾ cup sour cream + 2 tbsp cream per cup", "Crema is looser and less tangy than sour cream — cream fixes both."),
  ]),
  ing("chile-arbol", "Chiles de árbol", "chiles de árbol", ["chile de arbol", "chiles de arbol", "arbol chiles", "arbol chile", "arbol"], ["Mexican"], "Spice & Seasoning", [...LATIN, ...INTL], b("Dried chiles de árbol", "International", 2.99), [
    s("Crushed red pepper flakes", "crushed red pepper flakes", 85, M, [b("Crushed red pepper flakes", "Spices", 2.49)], "½ tsp flakes per chile", "Same bright, sharp, clean heat."),
    s("Cayenne pepper", "ground cayenne", 70, M, [b("Ground cayenne pepper", "Spices", 2.49)], "¼ tsp per chile", "Close in heat; slightly less fruity."),
  ]),
  ing("banana-leaves", "Banana leaves", "banana leaves", ["banana leaves", "banana leaf", "hoja de platano", "hojas de platano", "daun pisang"], ["Mexican", "Filipino", "Thai", "Vietnamese", "Guatemalan", "Indonesian"], "Pantry", [...ASIAN, ...LATSPEC], b("Frozen banana leaves", "Frozen", 3.99), [
    s("Parchment + foil", "parchment paper wrapped in foil", 72, M, [b("Parchment paper", "Baking", 3.99), b("Aluminum foil", "Paper & Wraps", 3.49)], "Wrap tightly, parchment inside, foil outside", "Traps steam just like leaves do — you only lose a faint grassy aroma."),
  ]),
  ing("yuca", "Yuca (cassava root)", "yuca", ["yuca", "yucca", "cassava", "manioc", "mandioca", "casava"], ["Cuban", "Brazilian", "Colombian", "Dominican", "Nigerian"], "Produce", [...LATIN, ...ASIAN, ...AFCAR], b("Yuca root or frozen yuca", "Produce", 2.49), [
    s("Yukon Gold potatoes", "Yukon Gold potatoes", 68, M, [b("Yukon Gold potatoes", "Produce", 3.99)], "1:1 by weight", "Starchy and dense — cooks up creamy with a similar mild sweetness."),
  ]),
  ing("sofrito", "Sofrito / recaíto", "sofrito", ["sofrito", "recaito", "recaíto", "culantro base"], ["Puerto Rican", "Dominican", "Cuban"], "Sauce & Paste", LATIN, b("Sofrito (jar or frozen)", "Frozen", 3.99), [
    s("Blended aromatics", "a quick blend of onion, bell pepper, garlic and cilantro", 88, M, [b("Yellow onion", "Produce", 0.99), b("Green bell pepper", "Produce", 0.99), b("Garlic", "Produce", 0.69), b("Cilantro", "Produce", 0.99)], "Blend 1 onion + 1 pepper + 6 garlic cloves + ½ bunch cilantro; 2 tbsp per ¼ cup sofrito", "That's the homemade recipe — freeze extras in ice-cube trays."),
  ]),
  ing("adobo-seasoning", "Adobo seasoning (Goya)", "adobo seasoning", ["adobo seasoning", "goya adobo", "adobo all purpose", "adobo spice"], ["Puerto Rican", "Cuban", "Dominican"], "Spice & Seasoning", [...LATIN, ...INTL], b("Goya adobo all-purpose seasoning", "International", 3.99), [
    s("DIY adobo blend", "homemade adobo (garlic powder, onion powder, oregano, pepper & salt)", 90, M, [b("Garlic powder", "Spices", 2.99), b("Onion powder", "Spices", 2.99), b("Dried oregano", "Spices", 2.49)], "1 tsp each garlic powder, onion powder, oregano + ½ tsp pepper + 1 tsp salt", "The famous blue-cap shaker is exactly this mix."),
  ]),
  ing("guava-paste", "Guava paste (goiabada)", "guava paste", ["guava paste", "goiabada", "pasta de guayaba", "bocadillo"], ["Cuban", "Brazilian"], "Pantry", LATIN, b("Guava paste", "International", 2.99), [
    s("Thick apricot preserves", "thick apricot preserves", 70, M, [b("Apricot preserves", "Condiments", 3.49)], "1:1, simmered a few minutes to thicken", "Sweet, fruity and sliceable when thickened."),
  ]),
  ing("piloncillo", "Piloncillo / panela", "piloncillo", ["piloncillo", "panela", "rapadura", "panocha"], ["Mexican", "Colombian"], "Pantry", LATIN, b("Piloncillo cones", "International", 2.49), [
    s("Dark brown sugar + molasses", "dark brown sugar with a spoon of molasses", 90, M, [b("Dark brown sugar", "Baking", 2.49), b("Molasses", "Baking", 3.99)], "1 cup brown sugar + 1 tsp molasses per 8 oz cone", "Piloncillo is raw cane sugar — brown sugar plus molasses recreates its smoky depth."),
  ]),
  ing("aji-dulce", "Ají dulce peppers", "ají dulce", ["aji dulce", "ají dulce", "ajicito", "cachucha pepper", "ajies dulces"], ["Puerto Rican", "Dominican", "Cuban"], "Produce", [...LATIN, ...AFCAR], b("Ají dulce peppers", "Produce", 2.99), [
    s("Mini sweet peppers + a sliver of habanero", "mini sweet peppers with a sliver of habanero", 78, M, [b("Mini sweet peppers", "Produce", 3.49), b("Habanero peppers", "Produce", 1.29)], "4 mini peppers + a tiny sliver of habanero per 4 ají dulce", "Ají dulce is aromatic with almost no heat — sweet peppers get the aroma."),
  ]),
  ing("hoja-santa", "Hoja santa", "hoja santa", ["hoja santa", "root beer plant", "mexican pepperleaf"], ["Mexican"], "Fresh Herb", LATSPEC, b("Hoja santa leaves", "Produce", 3.49), [
    s("Tarragon + basil", "fresh tarragon with a few basil leaves", 65, M, [b("Fresh tarragon", "Produce", 3.49), b("Fresh basil", "Produce", 2.99)], "2 parts tarragon : 1 part basil", "Hoja santa tastes of anise, mint and black pepper."),
  ]),
  ing("oaxaca-cheese", "Oaxaca cheese", "Oaxaca cheese", ["oaxaca cheese", "queso oaxaca", "quesillo", "queso quesadilla"], ["Mexican"], "Dairy", [...LATIN, ...INTL], b("Queso Oaxaca", "Dairy", 5.49), [
    s("Low-moisture mozzarella", "shredded low-moisture mozzarella", 90, M, [b("Low-moisture mozzarella", "Dairy", 3.99)], "1:1", "Oaxaca is a stretchy, mild string cheese — mozzarella melts the same way."),
  ]),
  ing("huacatay", "Huacatay (Peruvian black mint)", "huacatay", ["huacatay", "black mint", "peruvian black mint"], ["Peruvian"], "Fresh Herb", LATSPEC, b("Huacatay paste", "International", 4.99), [
    s("Mint + cilantro + basil", "a blend of mint, cilantro and basil", 70, M, [b("Fresh mint", "Produce", 2.49), b("Cilantro", "Produce", 0.99), b("Fresh basil", "Produce", 2.99)], "Equal parts, blended", "Huacatay tastes like mint, basil and tarragon in one."),
  ]),

  /* ---------------- Africa & Caribbean ---------------- */
  ing("suya-spice", "Suya spice (yaji)", "suya spice", ["suya spice", "yaji", "suya", "kuli kuli", "suya pepper"], ["Nigerian", "Ghanaian"], "Spice & Seasoning", AFCAR, b("Suya spice (yaji)", "International", 5.99), [
    s("DIY suya blend", "homemade suya spice (ground peanuts, paprika, cayenne, ginger, garlic & onion powder)", 85, M, [b("Roasted unsalted peanuts", "Snacks & Nuts", 3.49), b("Sweet paprika", "Spices", 2.99), b("Ground cayenne pepper", "Spices", 2.49), b("Ground ginger", "Spices", 3.29)], "¼ cup ground peanuts + 1 tbsp paprika + 1 tsp each cayenne, ginger, garlic & onion powder", "Suya is a peanut-chili dry rub — easy to rebuild at home."),
  ]),
  ing("ogbono", "Ogbono (wild mango seed)", "ogbono", ["ogbono", "ogbonno", "apon", "bush mango", "wild mango seeds"], ["Nigerian", "Ghanaian"], "Pantry", AFCAR, b("Ground ogbono", "International", 8.99), [
    s("Chopped okra + ground pepitas", "finely chopped okra with ground pepitas", 70, M, [b("Okra", "Produce", 2.99), b("Raw hulled pumpkin seeds (pepitas)", "Snacks & Nuts", 4.99)], "½ cup minced okra + ¼ cup ground pepitas per ½ cup ogbono", "Ogbono gives the soup its signature slippery 'draw' — okra does the same."),
    s("Ground flaxseed + pepitas", "ground flaxseed with ground pepitas", 62, M, [b("Ground flaxseed", "Baking", 4.49)], "2 tbsp flax + ¼ cup pepitas per ½ cup", "Flax gels when simmered for a similar silky texture."),
  ]),
  ing("uziza", "Uziza seeds / leaves", "uziza", ["uziza", "uziza seeds", "uziza leaves", "ashanti pepper", "false cubeb"], ["Nigerian"], "Spice & Seasoning", AFCAR, b("Ground uziza seed", "International", 4.99), [
    s("Black pepper + basil", "cracked black pepper with a few basil leaves", 65, M, [b("Whole black peppercorns", "Spices", 3.99), b("Fresh basil", "Produce", 2.99)], "½ tsp pepper + 3 basil leaves per tsp uziza", "Uziza is peppery with a green, clove-like note."),
  ]),
  ing("cassava-leaves", "Cassava leaves (saka saka)", "cassava leaves", ["cassava leaves", "saka saka", "pondu", "manioc leaves"], ["Congolese", "Liberian", "Sierra Leonean"], "Produce", AFCAR, b("Frozen cassava leaves", "Frozen", 4.99), [
    s("Collards + spinach", "finely chopped collard greens and spinach", 75, M, [b("Collard greens", "Produce", 2.49), b("Fresh spinach", "Produce", 3.49)], "1:1 blend, simmered 30 min", "Hearty and slightly bitter like cassava greens."),
  ]),
  ing("palm-nut-cream", "Palm nut cream", "palm nut cream", ["palm nut cream", "cream of palm", "palmnut concentrate", "palm nut concentrate", "sauce graine"], ["Ghanaian", "Nigerian", "Ivorian"], "Pantry", AFCAR, b("Palm nut cream (can)", "International", 4.99), [
    s("Coconut cream + paprika", "coconut cream with a little paprika", 62, M, [b("Coconut cream", "International", 2.99), b("Sweet paprika", "Spices", 2.99)], "1 cup coconut cream + 1 tsp paprika", "Rich, orange-red and creamy — flavor is milder and sweeter."),
  ]),
  ing("harissa", "Harissa", "harissa", ["harissa", "harissa paste", "rose harissa"], ["Tunisian", "Moroccan", "Algerian"], "Sauce & Paste", [...NAT, ...INTL, ...MIDEAST], b("Harissa paste", "International", 4.49), [
    s("Pepper flakes + smoked paprika + garlic", "a quick harissa of chili flakes, smoked paprika, garlic, cumin and olive oil", 78, M, [b("Crushed red pepper flakes", "Spices", 2.49), b("Smoked paprika", "Spices", 3.49), b("Ground cumin", "Spices", 2.99)], "1 tsp flakes + 1 tsp smoked paprika + 1 garlic clove + ½ tsp cumin + 1 tbsp oil per tbsp", "Smoky, garlicky, hot — harissa's whole personality."),
  ]),
  ing("mitmita", "Mitmita", "mitmita", ["mitmita", "mitmata"], ["Ethiopian", "Eritrean"], "Spice & Seasoning", AFCAR, b("Mitmita", "Spices", 6.49), [
    s("Cayenne + cardamom + cloves", "cayenne with a pinch of cardamom, cloves and salt", 75, M, [b("Ground cayenne pepper", "Spices", 2.49), b("Ground cardamom", "Spices", 6.99), b("Whole cloves", "Spices", 4.29)], "1 tbsp cayenne + ¼ tsp cardamom + pinch ground cloves + ½ tsp salt", "Mitmita is hotter than berbere — mainly chili with a little warm spice."),
  ]),
  ing("orange-blossom-water", "Orange blossom water", "orange blossom water", ["orange blossom water", "orange flower water", "mazahar", "mazaher"], ["Moroccan", "Lebanese", "French"], "Pantry", [...MIDEAST, ...NAT, ...INTL], b("Orange blossom water", "International", 4.49), [
    s("Orange zest + vanilla", "fresh orange zest with a drop of vanilla", 68, M, [b("Orange", "Produce", 0.99), b("Pure vanilla extract", "Baking", 6.99)], "½ tsp zest + 2 drops vanilla per tsp", "Captures the citrus-floral perfume."),
  ]),
  ing("rose-water", "Rose water", "rose water", ["rose water", "gulab jal", "maward", "rosewater"], ["Persian", "Lebanese", "Indian", "Turkish"], "Pantry", [...MIDEAST, ...NAT, ...INDIAN, ...INTL], b("Rose water", "International", 3.99), [
    s("Vanilla + lemon zest", "a drop of vanilla with a little lemon zest", 55, M, [b("Pure vanilla extract", "Baking", 6.99), b("Lemon", "Produce", 0.79)], "2 drops vanilla + pinch zest per tsp", "No rose, but a similar fragrant lift."),
  ]),
  ing("ackee", "Ackee", "ackee", ["ackee", "akee"], ["Jamaican"], "Produce", AFCAR, b("Canned ackee", "International", 8.99), [
    s("Hearts of palm + turmeric", "crumbled hearts of palm with a pinch of turmeric", 70, M, [b("Canned hearts of palm", "Canned Goods", 3.99), b("Ground turmeric", "Spices", 2.99)], "1:1, gently folded in at the end", "Hearts of palm flake and turn golden like ackee."),
  ]),
  ing("saltfish", "Salt cod (saltfish / bacalao)", "salt cod", ["saltfish", "salt fish", "salt cod", "bacalao", "bacalhau", "baccala", "baccalà", "salted cod"], ["Jamaican", "Portuguese", "Spanish", "Italian", "Puerto Rican"], "Protein", [...LATSPEC, ...AFCAR, ...EURO], b("Salt cod", "Meat & Seafood", 9.99), [
    s("Quick-salted fresh cod", "fresh cod salted for a few hours", 82, M, [b("Fresh cod fillets", "Meat & Seafood", 9.99), b("Kosher salt", "Spices", 3.49)], "Bury 1 lb cod in ½ cup kosher salt 4 hours; rinse well", "That's literally how salt cod is made — just faster."),
  ]),
  ing("callaloo", "Callaloo greens", "callaloo", ["callaloo", "calaloo", "amaranth leaves", "dasheen leaves", "bhaji", "chinese spinach"], ["Jamaican", "Trinidadian"], "Produce", AFCAR, b("Callaloo (canned or fresh)", "International", 3.49), [
    s("Baby spinach", "baby spinach", 85, M, [b("Baby spinach", "Produce", 3.49)], "1:1", "Mild, tender and earthy — the same family of leafy greens."),
  ]),
  ing("cassareep", "Cassareep", "cassareep", ["cassareep"], ["Guyanese"], "Sauce & Paste", AFCAR, b("Cassareep", "International", 5.99), [
    s("Dark soy + molasses + allspice", "dark soy sauce, molasses and a pinch of allspice", 66, M, [b("Soy sauce", "International", 2.99), b("Molasses", "Baking", 3.99), b("Ground allspice", "Spices", 3.49)], "1 tbsp soy + 1 tbsp molasses + pinch allspice per 2 tbsp", "Dark, bittersweet and savory like cassareep."),
  ]),
  ing("piri-piri", "Piri-piri / peri-peri", "piri-piri sauce", ["piri piri", "peri peri", "piripiri", "pili pili"], ["Portuguese", "Mozambican", "Angolan"], "Sauce & Paste", [...AFCAR, ...INTL, ...EURO], b("Piri-piri sauce", "International", 3.99), [
    s("Hot sauce + lemon + garlic + paprika", "hot sauce blended with lemon juice, garlic and paprika", 82, M, [b("Louisiana-style hot sauce", "Condiments", 2.49), b("Lemon", "Produce", 0.79), b("Garlic", "Produce", 0.69), b("Sweet paprika", "Spices", 2.99)], "¼ cup hot sauce + 2 tbsp lemon + 1 garlic clove + 1 tsp paprika", "Piri-piri is a bright chili-citrus-garlic sauce."),
  ]),

  /* ---------------- East & Southeast Asia ---------------- */
  ing("mirin", "Mirin", "mirin", ["mirin", "hon mirin", "aji mirin", "sweet rice wine"], ["Japanese"], "Sauce & Paste", [...INTL, ...ASIAN, ...NAT], b("Mirin", "International", 4.49), [
    s("Dry sherry + sugar", "dry sherry with a pinch of sugar", 85, M, [b("Dry sherry", "Wine & Cooking Wine", 6.99), b("Sugar", "Baking", 2.99)], "1 tbsp sherry + ½ tsp sugar per tbsp mirin", "Mirin is sweet cooking wine — sherry plus sugar mimics it."),
  ]),
  ing("sake", "Sake (cooking)", "sake", ["sake", "cooking sake", "junmai", "nihonshu"], ["Japanese"], "Sauce & Paste", [...ASIAN, ...INTL], b("Cooking sake", "International", 5.99), [
    s("Dry white wine or dry sherry", "dry sherry", 82, M, [b("Dry sherry", "Wine & Cooking Wine", 6.99)], "1:1", "Clean, slightly sweet and acidic like sake."),
  ]),
  ing("shiso", "Shiso / perilla leaves", "shiso", ["shiso", "perilla", "perilla leaves", "kkaennip", "ooba", "tia to", "green shiso"], ["Japanese", "Korean", "Vietnamese"], "Fresh Herb", ASIAN, b("Shiso leaves", "Produce", 2.99), [
    s("Basil + mint", "basil with a little mint", 70, M, [b("Fresh basil", "Produce", 2.99), b("Fresh mint", "Produce", 2.49)], "2 basil : 1 mint", "Shiso reads as minty, basil-like and faintly cinnamon."),
  ]),
  ing("kombu", "Kombu (dried kelp)", "kombu", ["kombu", "dried kelp", "kelp", "konbu"], ["Japanese", "Korean"], "Pantry", [...ASIAN, ...NAT, ...INTL], b("Dried kombu", "International", 5.49), [
    s("Roasted seaweed sheet", "a sheet of roasted nori", 68, M, [b("Roasted seaweed snacks", "Snacks", 1.99)], "1 nori sheet per 4-inch kombu", "Adds the same ocean-y glutamate depth, with a toastier note."),
  ]),
  ing("wakame", "Wakame seaweed", "wakame", ["wakame", "dried seaweed", "miyeok"], ["Japanese", "Korean"], "Pantry", [...ASIAN, ...NAT, ...INTL], b("Dried wakame", "International", 3.99), [
    s("Spinach + nori flakes", "baby spinach with crumbled nori", 62, M, [b("Baby spinach", "Produce", 3.49), b("Roasted seaweed snacks", "Snacks", 1.99)], "1 cup spinach + ½ sheet nori per tbsp dried wakame", "Silky green leaves with a sea-salty edge."),
  ]),
  ing("udon", "Udon noodles", "udon", ["udon", "udon noodles"], ["Japanese"], "Grain & Flour", [...ASIAN, ...NAT, ...INTL], b("Udon noodles", "International", 3.49), [
    s("Linguine or fettuccine", "thick linguine", 58, M, [b("Linguine", "Pasta", 1.49)], "1:1, cooked soft", "Thick, slippery wheat noodles — not chewy like udon, but the closest widely sold."),
  ]),
  ing("soba", "Soba noodles", "soba", ["soba", "soba noodles", "buckwheat noodles"], ["Japanese"], "Grain & Flour", [...ASIAN, ...NAT, ...INTL], b("Soba noodles", "International", 3.99), [
    s("Whole-wheat spaghetti", "whole-wheat spaghetti", 60, M, [b("Whole wheat spaghetti", "Pasta", 1.99)], "1:1", "Nutty and earthy like buckwheat noodles."),
  ]),
  ing("doenjang", "Doenjang (Korean soybean paste)", "doenjang", ["doenjang", "deonjang", "korean soybean paste", "soybean paste", "korean miso"], ["Korean"], "Sauce & Paste", ASIAN, b("Doenjang", "International", 5.99), [
    s("Red miso + soy sauce", "red miso with a splash of soy sauce", 80, [...NAT, ...INTL, ...ASIAN], [b("Red miso paste", "International", 5.49), b("Soy sauce", "International", 2.99)], "1 tbsp miso + ½ tsp soy per tbsp", "Both are fermented soybean pastes — doenjang is just funkier and saltier."),
  ]),
  ing("ssamjang", "Ssamjang", "ssamjang", ["ssamjang"], ["Korean"], "Sauce & Paste", ASIAN, b("Ssamjang", "International", 4.99), [
    s("Hoisin + sriracha + sesame oil", "hoisin mixed with sriracha, sesame oil and garlic", 65, M, [b("Hoisin sauce", "International", 3.49), b("Sriracha", "International", 3.49), b("Toasted sesame oil", "International", 3.99)], "2 tbsp hoisin + 1 tsp sriracha + 1 tsp sesame oil + 1 minced garlic clove", "Sweet, spicy and savory — the dipping-paste trifecta."),
  ]),
  ing("tteok", "Tteok (Korean rice cakes)", "rice cakes", ["tteok", "tteokbokki", "tteokbokki rice cakes", "garaetteok", "korean rice cakes", "rice cakes"], ["Korean"], "Grain & Flour", ASIAN, b("Tteok rice cakes", "Refrigerated", 4.99), [
    s("Shelf-stable gnocchi", "shelf-stable potato gnocchi", 72, M, [b("Shelf-stable gnocchi", "Pasta", 3.49)], "1:1 by weight, pan-seared for chew", "Soft, chewy, pillowy — surprisingly close in bite."),
  ]),
  ing("korean-pear", "Korean / Asian pear", "Asian pear", ["korean pear", "asian pear", "nashi pear", "nashi"], ["Korean", "Japanese", "Chinese"], "Produce", [...ASIAN, ...NAT, ...INTL], b("Asian pear", "Produce", 2.49), [
    s("Bosc pear or Fuji apple", "a firm Bosc pear", 85, M, [b("Bosc pears", "Produce", 2.99)], "1:1", "Crisp, juicy and sweet — the same tenderizing enzymes in marinades."),
  ]),
  ing("wood-ear", "Wood ear mushrooms", "wood ear mushrooms", ["wood ear", "wood ear mushroom", "wood ear mushrooms", "cloud ear", "black fungus", "mu er", "muer"], ["Chinese", "Vietnamese", "Korean"], "Produce", ASIAN, b("Dried wood ear mushrooms", "International", 3.99), [
    s("Cremini mushrooms, sliced thin", "thinly sliced cremini mushrooms", 62, M, [b("Cremini mushrooms", "Produce", 2.99)], "1:1 by weight", "Different crunch, but a similar earthy bite."),
  ]),
  ing("lap-cheong", "Lap cheong (Chinese sausage)", "lap cheong", ["lap cheong", "lap chong", "chinese sausage", "lop cheung", "lap cheung"], ["Chinese", "Vietnamese", "Cantonese"], "Protein", ASIAN, b("Lap cheong", "Meat & Seafood", 6.99), [
    s("Smoked sausage + honey", "sliced smoked sausage glazed with a little honey", 68, M, [b("Smoked kielbasa", "Meat & Seafood", 5.49), b("Honey", "Baking", 4.99)], "1:1, tossed with 1 tsp honey per link", "Sweet-savory cured pork — kielbasa with honey gets there."),
  ]),
  ing("black-vinegar", "Chinkiang black vinegar", "black vinegar", ["black vinegar", "chinkiang vinegar", "zhenjiang vinegar", "chinese black vinegar", "chinkiang"], ["Chinese"], "Sauce & Paste", ASIAN, b("Chinkiang vinegar", "International", 3.99), [
    s("Balsamic + a dash of soy", "balsamic vinegar with a dash of soy sauce", 80, M, [b("Balsamic vinegar", "Oils & Vinegars", 3.99), b("Soy sauce", "International", 2.99)], "1 tbsp balsamic + ¼ tsp soy per tbsp", "Dark, malty and gently sweet."),
  ]),
  ing("sesame-paste", "Chinese sesame paste", "sesame paste", ["sesame paste", "chinese sesame paste", "zhi ma jiang"], ["Chinese"], "Sauce & Paste", ASIAN, b("Chinese sesame paste", "International", 5.99), [
    s("Tahini + toasted sesame oil", "tahini with a few drops of toasted sesame oil", 90, M, [b("Tahini", "International", 5.99), b("Toasted sesame oil", "International", 3.99)], "1 tbsp tahini + ¼ tsp sesame oil per tbsp", "Chinese paste uses toasted seeds — the oil adds that roasted depth."),
  ]),
  ing("gai-lan", "Gai lan (Chinese broccoli)", "Chinese broccoli", ["gai lan", "chinese broccoli", "kai lan", "kailan", "gailan"], ["Chinese", "Thai", "Vietnamese"], "Produce", ASIAN, b("Gai lan", "Produce", 3.49), [
    s("Broccolini", "broccolini", 90, M, [b("Broccolini", "Produce", 3.49)], "1:1", "Same leafy-stem structure with a pleasant bitterness."),
  ]),
  ing("tapioca-starch", "Tapioca starch", "tapioca starch", ["tapioca starch", "tapioca flour", "tapioca", "cassava starch"], ["Brazilian", "Thai", "Vietnamese", "Chinese"], "Grain & Flour", [...ASIAN, ...NAT, ...INTL], b("Tapioca starch", "Baking", 3.99), [
    s("Cornstarch", "cornstarch", 80, M, [b("Cornstarch", "Baking", 1.99)], "1:1 (use slightly less)", "Thickens the same way, with less chew."),
  ]),
  ing("glutinous-rice", "Glutinous (sticky) rice", "sticky rice", ["glutinous rice", "sticky rice", "sweet rice", "mochigome", "khao niao", "malagkit"], ["Thai", "Lao", "Filipino", "Chinese", "Japanese"], "Grain & Flour", [...ASIAN, ...NAT, ...INTL], b("Thai glutinous rice", "Rice & Grains", 5.99), [
    s("Sushi rice", "short-grain sushi rice", 70, [...INTL, ...NAT, ...ASIAN], [b("Nishiki sushi rice", "International", 6.99)], "1:1, rinsed, with a little less water", "Sticky and tender, though less dense."),
    s("Arborio rice", "arborio rice", 62, M, [b("Arborio rice", "Rice & Grains", 3.99)], "1:1, rinsed well", "Starchy enough to clump together."),
  ]),
  ing("pandan", "Pandan leaves", "pandan", ["pandan", "pandan leaves", "pandan leaf", "screwpine", "bai toey", "pandan extract"], ["Thai", "Indonesian", "Malaysian", "Filipino"], "Fresh Herb", ASIAN, b("Frozen pandan leaves", "Frozen", 3.99), [
    s("Vanilla + a bay leaf", "a drop of vanilla with a bay leaf", 55, M, [b("Pure vanilla extract", "Baking", 6.99), b("Bay leaves", "Spices", 2.99)], "½ tsp vanilla + 1 bay leaf per 2 pandan leaves", "Pandan smells like vanilla, coconut and fresh hay."),
  ]),
  ing("tempeh", "Tempeh", "tempeh", ["tempeh", "tempe"], ["Indonesian", "Malaysian"], "Protein", [...NAT, ...ASIAN], b("Tempeh", "Refrigerated", 3.99), [
    s("Extra-firm tofu", "pressed extra-firm tofu", 65, M, [b("Extra-firm tofu", "Refrigerated", 2.49)], "1:1, pressed and cubed", "Soaks up marinades — without the nutty fermented chew."),
  ]),
  ing("candlenut", "Candlenuts (kemiri)", "candlenuts", ["candlenut", "candlenuts", "kemiri", "buah keras"], ["Indonesian", "Malaysian"], "Pantry", ASIAN, b("Candlenuts", "International", 3.99), [
    s("Macadamia nuts", "macadamia nuts", 90, M, [b("Macadamia nuts", "Snacks & Nuts", 8.99)], "1:1", "Rich, buttery and mild — the standard stand-in."),
  ]),
  ing("rau-ram", "Rau răm (Vietnamese coriander)", "Vietnamese coriander", ["rau ram", "rau răm", "vietnamese coriander", "laksa leaf", "daun kesum", "vietnamese mint"], ["Vietnamese", "Malaysian", "Cambodian"], "Fresh Herb", ASIAN, b("Rau răm", "Produce", 1.99), [
    s("Cilantro + mint + lime zest", "cilantro and mint with a little lime zest", 72, M, [b("Cilantro", "Produce", 0.99), b("Fresh mint", "Produce", 2.49), b("Limes", "Produce", 1.99)], "Equal parts + pinch of zest", "Peppery, citrusy and cilantro-like."),
  ]),
  ing("rice-paper", "Rice paper wrappers", "rice paper", ["rice paper", "bánh tráng", "banh trang", "rice paper wrappers", "spring roll rice paper"], ["Vietnamese", "Thai"], "Grain & Flour", [...ASIAN, ...INTL, ...NAT], b("Rice paper wrappers", "International", 3.49), [
    s("Butter lettuce cups", "butter lettuce leaves", 60, M, [b("Butter lettuce", "Produce", 2.99)], "1 leaf per wrapper", "Skip the wrapping — lettuce cups carry the same fillings."),
  ]),
  ing("rice-vermicelli", "Rice vermicelli", "rice vermicelli", ["rice vermicelli", "bun noodles", "thin rice noodles", "mai fun", "maifun", "rice sticks vermicelli"], ["Vietnamese", "Thai", "Chinese"], "Grain & Flour", [...ASIAN, ...INTL, ...NAT], b("Rice vermicelli", "International", 2.49), [
    s("Angel hair pasta", "angel hair pasta", 55, M, [b("Angel hair pasta", "Pasta", 1.49)], "Cook 1 minute less than package", "Thin and light — wheat instead of rice, but the closest shape."),
  ]),
  ing("jackfruit", "Young green jackfruit", "young jackfruit", ["jackfruit", "young jackfruit", "green jackfruit", "langka", "nangka", "kathal"], ["Filipino", "Indian", "Indonesian", "Thai"], "Produce", [...ASIAN, ...NAT, ...INDIAN], b("Canned young jackfruit", "International", 2.99), [
    s("Canned artichoke hearts", "canned artichoke hearts, shredded", 70, M, [b("Canned artichoke hearts", "Canned Goods", 3.49)], "1:1, drained and shredded", "Mild, meaty and shreddable."),
  ]),
  ing("banana-blossom", "Banana blossom", "banana blossom", ["banana blossom", "banana flower", "puso ng saging", "kela phool"], ["Filipino", "Thai", "Indian", "Vietnamese"], "Produce", ASIAN, b("Canned banana blossom", "International", 2.99), [
    s("Canned artichoke hearts", "canned artichoke hearts", 75, M, [b("Canned artichoke hearts", "Canned Goods", 3.49)], "1:1, drained", "Tender, petal-like layers with a mild tang."),
  ]),
  ing("ube", "Ube (purple yam)", "ube", ["ube", "purple yam", "ube halaya", "ube jam"], ["Filipino"], "Produce", ASIAN, b("Frozen grated ube", "Frozen", 5.99), [
    s("Sweet potato + vanilla", "mashed sweet potato with a drop of vanilla", 70, M, [b("Sweet potatoes", "Produce", 2.99), b("Pure vanilla extract", "Baking", 6.99)], "1:1 by weight + ½ tsp vanilla per cup", "Sweet, creamy and earthy; add purple food coloring for the look."),
  ]),
  ing("banana-ketchup", "Banana ketchup", "banana ketchup", ["banana ketchup", "banana sauce", "jufran"], ["Filipino"], "Sauce & Paste", ASIAN, b("Banana ketchup", "International", 2.99), [
    s("Ketchup + ripe banana + vinegar", "ketchup mashed with a little ripe banana and vinegar", 80, M, [b("Ketchup", "Condiments", 2.49), b("Bananas", "Produce", 0.69)], "½ cup ketchup + ¼ mashed banana + 1 tsp vinegar", "Banana ketchup is a sweet, tangy, fruity ketchup."),
  ]),
  ing("lumpia-wrapper", "Lumpia / spring roll wrappers", "lumpia wrappers", ["lumpia wrapper", "lumpia wrappers", "spring roll wrapper", "spring roll wrappers", "egg roll wrappers", "egg roll wrapper", "wonton skin", "wonton skins", "wonton wrapper", "wonton wrappers"], ["Filipino", "Chinese", "Vietnamese"], "Grain & Flour", [...ASIAN, ...INTL, ...NAT], b("Lumpia wrappers", "Frozen", 3.99), [
    s("Egg roll wrappers, trimmed", "egg roll wrappers cut to size", 78, M, [b("Egg roll wrappers", "Produce", 2.99)], "Cut in half for lumpia-size rolls", "Thicker, but fry up crisp and golden."),
  ]),

  /* ---------------- South Asia ---------------- */
  ing("amchur", "Amchur (dry mango powder)", "amchur", ["amchur", "amchoor", "dry mango powder", "mango powder", "aamchur"], ["Indian"], "Spice & Seasoning", INDIAN, b("Amchur powder", "Spices", 3.49), [
    s("Lemon juice or zest", "a squeeze of lemon juice", 75, M, [b("Lemons", "Produce", 0.79)], "1 tsp lemon juice per ½ tsp amchur, added at the end", "Amchur adds sourness without liquid — lemon does the same."),
  ]),
  ing("chaat-masala", "Chaat masala", "chaat masala", ["chaat masala", "chat masala"], ["Indian", "Pakistani"], "Spice & Seasoning", INDIAN, b("Chaat masala", "Spices", 2.99), [
    s("Garam masala + cumin + lemon + salt", "garam masala with ground cumin, lemon juice and salt", 72, M, [b("Garam masala", "Spices", 4.49), b("Ground cumin", "Spices", 2.99), b("Lemons", "Produce", 0.79)], "½ tsp garam masala + ½ tsp cumin + ¼ tsp salt + squeeze lemon", "Tangy, salty, funky spice blend."),
  ]),
  ing("kala-namak", "Kala namak (black salt)", "black salt", ["kala namak", "black salt", "himalayan black salt", "sanchal"], ["Indian", "Pakistani"], "Spice & Seasoning", INDIAN, b("Kala namak", "Spices", 3.49), [
    s("Salt + cumin + lemon", "regular salt with a pinch of cumin and a squeeze of lemon", 55, M, [b("Kosher salt", "Spices", 3.49), b("Ground cumin", "Spices", 2.99)], "1 tsp salt + pinch cumin + few drops lemon", "You lose the sulfurous 'egg' aroma but keep the tang."),
  ]),
  ing("ajwain", "Ajwain (carom seeds)", "ajwain", ["ajwain", "carom seeds", "ajowan", "bishop's weed", "bishops weed"], ["Indian", "Pakistani"], "Spice & Seasoning", INDIAN, b("Ajwain seeds", "Spices", 3.49), [
    s("Dried thyme + a pinch of cumin", "dried thyme with a pinch of cumin", 80, M, [b("Dried thyme", "Spices", 2.99), b("Cumin seed", "Spices", 3.49)], "¾ tsp thyme + ¼ tsp cumin per tsp ajwain", "Ajwain tastes like a sharper, more pungent thyme."),
  ]),
  ing("kalonji", "Kalonji (nigella seeds)", "nigella seeds", ["kalonji", "nigella seeds", "nigella", "black seed", "black onion seeds", "charnushka"], ["Indian", "Persian", "Turkish", "Armenian"], "Spice & Seasoning", [...INDIAN, ...MIDEAST, ...NAT], b("Nigella seeds", "Spices", 3.99), [
    s("Black sesame + a pinch of cumin", "black sesame seeds with a pinch of cumin", 60, M, [b("Black sesame seeds", "Spices", 3.49), b("Cumin seed", "Spices", 3.49)], "1:1 with a pinch of cumin", "Nutty and slightly peppery — similar look and crunch."),
  ]),
  ing("besan", "Besan (chickpea flour)", "chickpea flour", ["besan", "gram flour", "chickpea flour", "garbanzo flour", "chana flour"], ["Indian", "Pakistani", "Nepali"], "Grain & Flour", [...INDIAN, ...NAT, ...MIDEAST], b("Besan", "Baking", 3.99), [
    s("Ground dried chickpeas", "dried chickpeas ground fine in a blender", 88, M, [b("Dried chickpeas", "Rice & Grains", 1.99)], "1:1 after grinding to a fine powder", "Besan is just ground chickpeas."),
  ]),
  ing("atta", "Atta (chapati flour)", "atta flour", ["atta", "chapati flour", "ata flour", "durum atta", "roti flour", "chakki atta"], ["Indian", "Pakistani"], "Grain & Flour", INDIAN, b("Atta flour", "Baking", 6.99), [
    s("Whole-wheat + all-purpose flour", "a 1:1 mix of whole-wheat and all-purpose flour", 85, M, [b("Whole wheat flour", "Baking", 3.49), b("All-purpose flour", "Baking", 2.99)], "1:1 mix", "Atta is finely ground whole wheat — this gets soft, pliable rotis."),
  ]),
  ing("jaggery", "Jaggery (gur)", "jaggery", ["jaggery", "gur", "gud", "shakkar", "gula"], ["Indian", "Pakistani", "Sri Lankan"], "Pantry", [...INDIAN, ...ASIAN, ...NAT], b("Jaggery", "International", 3.99), [
    s("Dark brown sugar + molasses", "dark brown sugar with a dash of molasses", 88, M, [b("Dark brown sugar", "Baking", 2.49), b("Molasses", "Baking", 3.99)], "1 cup brown sugar + 1 tsp molasses per cup jaggery", "Both are unrefined-style sugars with caramel depth."),
  ]),
  ing("mustard-oil", "Mustard oil", "mustard oil", ["mustard oil", "sarson ka tel", "kachi ghani"], ["Indian", "Bangladeshi"], "Pantry", INDIAN, b("Mustard oil", "Oils & Vinegars", 6.99), [
    s("Neutral oil + a little Dijon", "neutral oil heated with a little Dijon mustard", 60, M, [b("Vegetable oil", "Oils & Vinegars", 3.99), b("Dijon mustard", "Condiments", 3.49)], "¼ cup oil + ½ tsp Dijon, heated gently", "Gets back some of the sharp mustard pungency."),
  ]),
  ing("chana-dal", "Chana dal", "chana dal", ["chana dal", "chana daal", "split chickpeas", "bengal gram"], ["Indian"], "Grain & Flour", [...INDIAN, ...NAT], b("Chana dal", "International", 3.99), [
    s("Yellow split peas", "yellow split peas", 82, M, [b("Yellow split peas", "Rice & Grains", 1.79)], "1:1", "Slightly softer, same nutty sweetness."),
  ]),
  ing("urad-dal", "Urad dal", "urad dal", ["urad dal", "urad daal", "black gram", "split black lentils", "urid dal", "black lentils split", "maa ki dal"], ["Indian"], "Grain & Flour", INDIAN, b("Urad dal", "International", 3.99), [
    s("French green lentils", "French green lentils, cooked a little longer", 60, M, [b("French green lentils", "Rice & Grains", 2.99)], "1:1", "Earthy and creamy when cooked down."),
  ], "Urad dal is split black gram, a creamy lentil used in dals, batters for dosa and idli, and dishes such as dal makhani."),
  ing("moong-dal", "Moong dal", "moong dal", ["moong dal", "mung dal", "split mung beans", "yellow moong", "moong daal", "mung beans", "mung bean", "green gram", "yellow mung beans"], ["Indian", "Chinese", "Vietnamese"], "Grain & Flour", [...INDIAN, ...ASIAN, ...NAT], b("Moong dal", "International", 3.49), [
    s("Red lentils", "red lentils", 75, M, [b("Red lentils", "Rice & Grains", 2.49)], "1:1, cooked slightly less", "Cook down to a similar soft, creamy mash."),
    s("Yellow split peas", "yellow split peas", 68, M, [b("Yellow split peas", "Rice & Grains", 1.79)], "1:1; simmer until very soft", "A sturdy pantry stand-in with a similar mellow, legume flavor."),
  ], "Moong dal is split mung bean (green gram), a small yellow legume used across Indian cooking. It cooks quickly and becomes soft and creamy in dal, khichdi, soups and sweets."),
  ing("khoya", "Khoya (mawa)", "khoya", ["khoya", "mawa", "khoa", "milk solids"], ["Indian", "Pakistani"], "Dairy", INDIAN, b("Khoya", "Refrigerated", 5.99), [
    s("Ricotta cooked down + milk powder", "ricotta simmered dry with milk powder", 80, M, [b("Whole-milk ricotta", "Dairy", 4.29), b("Nonfat dry milk powder", "Baking", 4.49)], "1 cup ricotta + 2 tbsp milk powder, stirred over low heat until dry and crumbly", "Reduces to the same dense, sweet milk solids."),
  ]),
  ing("tandoori-masala", "Tandoori masala", "tandoori masala", ["tandoori masala", "tandoori spice", "tandoori seasoning"], ["Indian", "Pakistani"], "Spice & Seasoning", INDIAN, b("Tandoori masala", "Spices", 3.99), [
    s("Garam masala + paprika + cumin", "garam masala with paprika, cumin, coriander and garlic powder", 82, M, [b("Garam masala", "Spices", 4.49), b("Sweet paprika", "Spices", 2.99), b("Ground cumin", "Spices", 2.99), b("Ground coriander", "Spices", 2.99)], "2 tsp garam masala + 1 tsp each paprika, cumin, coriander + ½ tsp garlic powder", "Tandoori blends are warm and red from chili and paprika."),
  ]),
  ing("sambar-powder", "Sambar powder", "sambar powder", ["sambar powder", "sambhar powder", "sambar masala", "rasam powder"], ["Indian"], "Spice & Seasoning", INDIAN, b("Sambar powder", "Spices", 3.49), [
    s("Curry powder + coriander + fenugreek", "curry powder with extra coriander and a pinch of fenugreek", 72, M, [b("Mild curry powder (McCormick)", "Spices", 3.99), b("Ground coriander", "Spices", 2.99)], "2 tsp curry + 1 tsp coriander + pinch fenugreek per 2 tsp", "A South Indian blend heavy on coriander, chili and dal-friendly spices."),
  ]),
  ing("fenugreek-seeds", "Fenugreek seeds (methi)", "fenugreek seeds", ["fenugreek seeds", "methi seeds", "methi dana", "fenugreek seed", "fenugreek"], ["Indian", "Ethiopian", "Persian"], "Spice & Seasoning", [...INDIAN, ...MIDEAST, ...NAT, ...INTL], b("Fenugreek seeds", "Spices", 3.99), [
    s("Mustard seeds + a drop of maple syrup", "mustard seeds with a drop of maple syrup", 60, M, [b("Yellow mustard seeds", "Spices", 3.49), b("Maple syrup", "Breakfast", 5.99)], "½ tsp mustard + 1 drop maple per tsp", "Fenugreek is bittersweet and maple-like (sotolon again)."),
  ]),

  /* ---------------- Middle East ---------------- */
  ing("freekeh", "Freekeh", "freekeh", ["freekeh", "farik", "frikeh", "firik"], ["Syrian", "Lebanese", "Palestinian", "Egyptian"], "Grain & Flour", [...MIDEAST, ...NAT], b("Cracked freekeh", "Rice & Grains", 5.99), [
    s("Farro", "farro", 80, M, [b("Farro", "Rice & Grains", 3.99)], "1:1", "Chewy and nutty; freekeh adds a light smoke."),
  ]),
  ing("zereshk", "Barberries (zereshk)", "barberries", ["zereshk", "barberries", "dried barberries", "berberis"], ["Persian"], "Pantry", MIDEAST, b("Dried barberries", "International", 7.99), [
    s("Dried cranberries + lemon", "dried cranberries with a squeeze of lemon", 80, M, [b("Dried cranberries", "Snacks & Nuts", 3.49), b("Lemon", "Produce", 0.79)], "1:1 + 1 tsp lemon juice per ¼ cup", "Tart, ruby and chewy."),
  ]),
  ing("advieh", "Advieh (Persian spice mix)", "advieh", ["advieh", "persian spice mix", "advieh polo", "advieh khoresh"], ["Persian"], "Spice & Seasoning", MIDEAST, b("Advieh", "Spices", 5.49), [
    s("Cinnamon + cardamom + cumin + turmeric", "cinnamon, cardamom, cumin and turmeric", 80, M, [b("Ground cinnamon", "Spices", 2.99), b("Ground cardamom", "Spices", 6.99), b("Ground cumin", "Spices", 2.99), b("Ground turmeric", "Spices", 2.99)], "1 tsp cinnamon + ½ tsp each cardamom, cumin, turmeric", "Persian advieh is a warm, floral sweet-spice mix."),
  ]),
  ing("date-syrup", "Date syrup (silan / dibs)", "date syrup", ["date syrup", "silan", "dibs", "date molasses", "date honey"], ["Lebanese", "Palestinian", "Iraqi", "Israeli"], "Pantry", [...MIDEAST, ...NAT], b("Date syrup", "International", 6.99), [
    s("Maple syrup + molasses", "maple syrup with a little molasses", 80, M, [b("Maple syrup", "Breakfast", 5.99), b("Molasses", "Baking", 3.99)], "3 tbsp maple + 1 tsp molasses per ¼ cup", "Dark, caramelly sweetness."),
  ]),
  ing("mahlab", "Mahlab", "mahlab", ["mahlab", "mahleb", "mahlepi"], ["Lebanese", "Turkish", "Greek", "Armenian"], "Spice & Seasoning", MIDEAST, b("Ground mahlab", "Spices", 4.99), [
    s("Almond extract + a pinch of anise", "a few drops of almond extract with a pinch of ground anise", 65, M, [b("Pure almond extract", "Baking", 6.99), b("Anise seed", "Spices", 3.49)], "3 drops extract + pinch anise per tsp", "Mahlab tastes like cherry pit and bitter almond."),
  ]),
  ing("sujuk", "Sujuk (spiced sausage)", "sujuk", ["sujuk", "sucuk", "soujouk", "sudjuk"], ["Turkish", "Armenian", "Lebanese"], "Protein", MIDEAST, b("Sujuk", "Meat & Seafood", 7.99), [
    s("Chorizo + a pinch of cumin", "chorizo with a pinch of cumin", 78, M, [b("Dry-cured chorizo", "Meat & Seafood", 5.99)], "1:1", "Garlicky, paprika-red and cumin-forward like sujuk."),
  ]),
  ing("ajvar", "Ajvar", "ajvar", ["ajvar", "red pepper spread", "pindjur"], ["Serbian", "Bosnian", "Macedonian"], "Sauce & Paste", [...EURO, ...INTL], b("Ajvar", "International", 4.99), [
    s("Roasted red peppers + eggplant + garlic", "blended roasted red peppers with roasted eggplant and garlic", 85, M, [b("Jarred roasted red peppers", "Canned Goods", 3.49), b("Eggplant", "Produce", 1.99), b("Garlic", "Produce", 0.69)], "1 jar peppers + 1 small roasted eggplant + 2 garlic cloves, blended", "That's ajvar's ingredient list."),
  ]),
  ing("grape-leaves", "Grape (vine) leaves", "grape leaves", ["grape leaves", "vine leaves", "warak enab", "dolma leaves", "grape leaf"], ["Greek", "Lebanese", "Turkish", "Armenian"], "Pantry", [...MIDEAST, ...INTL, ...EURO], b("Jarred grape leaves", "International", 4.99), [
    s("Blanched chard or collard leaves", "blanched Swiss chard or collard leaves", 82, M, [b("Swiss chard", "Produce", 2.99)], "Blanch 1 minute, trim the stem", "Pliable, mild and perfect for wrapping."),
  ]),
  ing("molokhia", "Molokhia (jute leaves)", "molokhia", ["molokhia", "mulukhiyah", "jute leaves", "mallow leaves", "melokhia", "mulukhia"], ["Egyptian", "Lebanese", "Syrian"], "Produce", [...MIDEAST, ...AFCAR], b("Frozen molokhia", "Frozen", 3.99), [
    s("Spinach + a little okra", "spinach with a little chopped okra", 68, M, [b("Fresh spinach", "Produce", 3.49), b("Okra", "Produce", 2.99)], "3 parts spinach : 1 part okra", "Okra brings the characteristic silky, slightly slippery texture."),
  ]),

  /* ---------------- Europe ---------------- */
  ing("guanciale", "Guanciale", "guanciale", ["guanciale"], ["Italian"], "Protein", [...EURO, ...NAT], b("Guanciale", "Deli", 9.99), [
    s("Pancetta or thick-cut bacon", "pancetta (or thick-cut bacon blanched in water)", 85, M, [b("Pancetta", "Deli", 5.99)], "1:1 by weight", "Cured pork fat, rendered crisp — bacon just adds smoke."),
  ]),
  ing("pecorino", "Pecorino Romano", "Pecorino Romano", ["pecorino", "pecorino romano"], ["Italian"], "Dairy", [...EURO, ...NAT, ...INTL], b("Pecorino Romano", "Dairy", 6.99), [
    s("Parmesan + a pinch of salt", "grated Parmesan with a pinch of extra salt", 85, M, [b("Parmesan", "Dairy", 5.99)], "1:1, using a bit less salt elsewhere", "Pecorino is saltier and tangier — Parmesan plus salt covers it."),
  ]),
  ing("flour-00", "Tipo 00 flour", "00 flour", ["00 flour", "tipo 00", "doppio zero", "tipo 00 flour"], ["Italian"], "Grain & Flour", [...EURO, ...NAT, ...INTL], b("Tipo 00 flour", "Baking", 4.99), [
    s("All-purpose + cake flour", "all-purpose flour with a bit of cake flour", 85, M, [b("All-purpose flour", "Baking", 2.99), b("Cake flour", "Baking", 3.99)], "¾ cup AP + ¼ cup cake flour per cup", "Gets the soft, fine texture of 00."),
  ]),
  ing("nduja", "'Nduja", "'nduja", ["nduja", "'nduja"], ["Italian"], "Protein", [...EURO, ...NAT], b("'Nduja", "Deli", 8.99), [
    s("Soft chorizo + tomato paste + chili flakes", "soft chorizo mashed with tomato paste and chili flakes", 70, M, [b("Dry-cured chorizo", "Meat & Seafood", 5.99), b("Tomato paste", "Canned Goods", 1.29)], "2 parts chorizo : 1 part tomato paste + pinch flakes", "Spreadable, fiery cured pork."),
  ]),
  ing("manchego", "Manchego", "Manchego", ["manchego"], ["Spanish"], "Dairy", [...NAT, ...INTL, ...EURO], b("Manchego", "Deli", 9.99), [
    s("Aged white cheddar", "aged white cheddar", 75, M, [b("Aged white cheddar", "Dairy", 4.99)], "1:1", "Firm, nutty and tangy."),
  ]),
  ing("creme-fraiche", "Crème fraîche", "crème fraîche", ["creme fraiche", "crème fraîche"], ["French"], "Dairy", [...NAT, ...INTL, ...EURO], b("Crème fraîche", "Dairy", 4.49), [
    s("Sour cream + heavy cream", "sour cream with a splash of heavy cream", 90, M, [b("Sour cream", "Dairy", 2.49), b("Heavy cream", "Dairy", 3.49)], "¾ cup sour cream + ¼ cup cream", "Richer and less tangy than sour cream alone."),
  ]),
  ing("lingonberry", "Lingonberry jam", "lingonberry jam", ["lingonberry", "lingonberries", "lingonberry jam", "lingonberry preserves"], ["Swedish", "Polish", "Russian"], "Pantry", [...EURO, ...INTL], b("Lingonberry jam", "International", 4.99), [
    s("Whole-berry cranberry sauce", "whole-berry cranberry sauce", 88, M, [b("Whole berry cranberry sauce", "Canned Goods", 2.49)], "1:1", "Tart, red and slightly bitter — nearly interchangeable."),
  ]),
  ing("kasha", "Kasha (toasted buckwheat)", "kasha", ["kasha", "buckwheat groats", "roasted buckwheat", "grechka"], ["Russian", "Polish", "Ukrainian"], "Grain & Flour", [...EURO, ...NAT], b("Kasha", "Rice & Grains", 3.99), [
    s("Toasted pearl barley", "pearl barley toasted in a dry pan", 68, M, [b("Pearl barley", "Rice & Grains", 2.49)], "1:1, toasted 3 minutes", "Nutty and chewy with a similar earthy bite."),
  ]),
  ing("spaetzle", "Spätzle", "spätzle", ["spaetzle", "spätzle", "spatzle"], ["German"], "Grain & Flour", EURO, b("Spätzle", "Refrigerated", 3.99), [
    s("Short egg noodles", "short egg noodles", 70, M, [b("Egg noodles", "Pasta", 2.29)], "1:1", "Soft egg dumpling-noodles."),
  ]),
  ing("sour-cherries", "Sour cherries (morello)", "sour cherries", ["sour cherries", "morello cherries", "amarena", "visciole", "tart cherries"], ["Polish", "Persian", "Turkish", "Hungarian"], "Produce", [...EURO, ...MIDEAST, ...INTL], b("Jarred morello cherries", "International", 6.99), [
    s("Canned tart pie cherries", "canned tart pie cherries in water", 90, M, [b("Canned tart cherries in water", "Canned Goods", 3.49)], "1:1, drained", "Same variety — tart Montmorency cherries."),
  ]),
  ing("khmeli-suneli", "Khmeli suneli", "khmeli suneli", ["khmeli suneli", "georgian spice blend", "svaneti salt"], ["Georgian"], "Spice & Seasoning", EURO, b("Khmeli suneli", "Spices", 4.99), [
    s("Coriander + basil + dill + fenugreek", "coriander with dried basil, dill and a pinch of fenugreek", 75, M, [b("Ground coriander", "Spices", 2.99), b("Dried basil", "Spices", 2.99), b("Dried dill", "Spices", 2.99)], "2 tsp coriander + 1 tsp each basil & dill + pinch fenugreek + ½ tsp paprika", "A Georgian herb-and-spice mix, heavy on coriander and blue fenugreek."),
  ]),
  ing("adjika", "Adjika", "adjika", ["adjika", "ajika", "abkhazian adjika"], ["Georgian", "Russian"], "Sauce & Paste", EURO, b("Adjika", "International", 4.99), [
    s("Roasted pepper + garlic + chili + walnuts", "blended roasted red pepper with garlic, chili flakes, walnuts and coriander", 78, M, [b("Jarred roasted red peppers", "Canned Goods", 3.49), b("Walnuts", "Snacks & Nuts", 5.99), b("Crushed red pepper flakes", "Spices", 2.49)], "1 jar peppers + 3 garlic cloves + 1 tbsp flakes + ¼ cup walnuts + 1 tsp coriander", "Spicy, garlicky, savory red paste."),
  ]),
  ing("cassava-flour", "Cassava flour", "cassava flour", ["cassava flour", "manioc flour", "yuca flour"], ["Brazilian", "Nigerian", "Colombian"], "Grain & Flour", [...NAT, ...LATIN, ...AFCAR, ...INTL], b("Cassava flour", "Baking", 7.99), [
    s("Rice flour + cornstarch", "rice flour mixed with cornstarch", 65, M, [b("White rice flour", "Baking", 3.99), b("Cornstarch", "Baking", 1.99)], "¾ cup rice flour + ¼ cup cornstarch per cup", "Gluten-free and fine-textured, though a bit less stretchy."),
  ]),
  ing("glutinous-rice-flour", "Glutinous rice flour", "glutinous rice flour", ["glutinous rice flour", "sticky rice flour", "sweet rice flour", "mochiko", "malagkit flour"], ["Japanese", "Chinese", "Filipino", "Thai", "Korean"], "Grain & Flour", [...ASIAN, ...NAT, ...INTL], b("Glutinous rice flour", "Baking", 3.49), [
    s("Rice flour + tapioca starch", "regular rice flour with a little tapioca starch", 72, M, [b("White rice flour", "Baking", 3.99), b("Cornstarch", "Baking", 1.99)], "1 cup rice flour + 1 tbsp cornstarch per cup", "Gets part of the chewy, mochi-like bounce."),
  ]),
  ing("jerk-seasoning", "Jerk seasoning / marinade", "jerk seasoning", ["jerk", "jerk seasoning", "jerk marinade", "jerk paste", "jerk spice", "walkerswood"], ["Jamaican"], "Sauce & Paste", [...AFCAR, ...INTL], b("Walkerswood jerk seasoning", "International", 4.99), [
    s("DIY jerk paste", "a quick jerk paste of allspice, thyme, scallion, habanero, garlic, ginger, soy sauce and brown sugar", 85, M, [b("Ground allspice", "Spices", 3.49), b("Fresh thyme", "Produce", 2.49), b("Scallions", "Produce", 0.99), b("Habanero peppers", "Produce", 1.29)], "Blend 1 tbsp allspice + 1 tbsp thyme + 3 scallions + 1 habanero + 3 garlic cloves + 1 tbsp soy + 1 tbsp brown sugar", "That's what's in the jar: allspice, scotch bonnet, thyme and scallion."),
  ]),
];
