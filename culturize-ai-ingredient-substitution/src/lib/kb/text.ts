/** Lowercase, strip accents and punctuation. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Very small plural stemmer — applied to both sides of every comparison so it only needs to be consistent. */
export function stemWord(w: string): string {
  if (w.length <= 3) return w;
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (/(ches|shes|sses|xes|zes)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith("oes")) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us")) return w.slice(0, -1);
  return w;
}

/** Normalized + stemmed text, e.g. "Scotch Bonnets" -> "scotch bonnet". */
export function stemText(text: string): string {
  return normalize(text)
    .replace(/\bchil{1,2}(?:ies|ie|is|es|i|e|s)\b/g, "chili") // chili / chilli / chile / chillies …
    .split(" ")
    .filter(Boolean)
    .map(stemWord)
    .join(" ");
}
