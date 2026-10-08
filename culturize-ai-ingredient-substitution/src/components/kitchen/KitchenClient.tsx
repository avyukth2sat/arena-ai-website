"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import DishCard from "@/components/DishCard";
import RecipeView, { StoreChip } from "@/components/recipe/RecipeView";
import { btnPrimary, btnSecondary, card, input, label } from "@/components/ui";
import type { DishSuggestion } from "@/app/api/dishes/suggest/route";
import { CUISINE_OPTIONS } from "@/lib/cuisines";
import { IngredientLookupPanel, MissingSwapPanel } from "@/components/kitchen/IngredientLookupPanel";
import type {
  CulturizedRecipe,
  CulturizeResponse,
  DishSummary,
  IngredientSearchResult,
  MissingIngredientResponse,
  ShoppingStyle,
  StoresResult,
} from "@/lib/types";

const LOADING_STEPS = [
  { icon: "🔎", text: "Finding the recipe — our library, cookbooks and the web" },
  { icon: "📍", text: "Locating grocery stores near you" },
  { icon: "🛒", text: "Checking what each store typically stocks" },
  { icon: "🌶️", text: "Flavor-matching hard-to-find ingredients" },
  { icon: "📝", text: "Rewriting the recipe around your swaps" },
];

const PASTE_EXAMPLE = `2 cups long-grain rice
3 tbsp gochugaru
1 tbsp fish sauce
6 makrut lime leaves
1 thumb galangal
2 tbsp palm sugar
1 lb chicken thighs
Salt to taste`;

const ZIP_KEY = "culturize:zip";

interface Props {
  dishes: DishSummary[];
  initialDish: string;
  initialZip: string;
  initialMode: "dish" | "paste" | "ingredient" | "missing";
  autoRun: boolean;
  aiEnabled: boolean;
}

export default function KitchenClient({ dishes, initialDish, initialZip, initialMode, autoRun, aiEnabled }: Props) {
  const [mode, setMode] = useState<"dish" | "paste" | "ingredient" | "missing">(initialMode);
  const [dish, setDish] = useState(initialMode === "ingredient" ? "" : initialDish);
  const [ingredientQuery, setIngredientQuery] = useState(initialMode === "ingredient" ? initialDish : "");
  const [missingIngredient, setMissingIngredient] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [zip, setZip] = useState(initialZip);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [servings, setServings] = useState<number | null>(null);
  const [style, setStyle] = useState<ShoppingStyle>("authentic");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");

  const [stores, setStores] = useState<StoresResult | null>(null);
  const [storesLoading, setStoresLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<CulturizedRecipe | null>(null);
  const [ingredientInfo, setIngredientInfo] = useState<IngredientSearchResult | null>(null);
  const [missingResult, setMissingResult] = useState<Extract<MissingIngredientResponse, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<DishSummary[]>([]);
  const [typeahead, setTypeahead] = useState<DishSuggestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);

  const zipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storesCtrl = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);

  async function lookupStores(query: string, onDone?: (r: StoresResult) => void) {
    storesCtrl.current?.abort();
    const ctrl = new AbortController();
    storesCtrl.current = ctrl;
    setStoresLoading(true);
    try {
      const res = await fetch(`/api/stores?${query}`, { signal: ctrl.signal });
      if (res.ok) {
        const data = (await res.json()) as StoresResult;
        setStores(data);
        onDone?.(data);
      }
    } catch {
      /* aborted or offline */
    } finally {
      if (storesCtrl.current === ctrl) setStoresLoading(false);
    }
  }

  function onZipChange(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 5);
    setZip(clean);
    setCoords(null);
    setGeoError(null);
    if (zipTimer.current) clearTimeout(zipTimer.current);
    if (clean.length === 5) {
      try {
        localStorage.setItem(ZIP_KEY, clean);
      } catch {
        /* storage unavailable */
      }
      zipTimer.current = setTimeout(() => lookupStores(`zip=${clean}`), 400);
    } else {
      storesCtrl.current?.abort();
      setStores(null);
      setStoresLoading(false);
    }
  }

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setGeoError("Location isn't available in this browser — enter a ZIP instead.");
      return;
    }
    setGeoError(null);
    setStoresLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: +pos.coords.latitude.toFixed(4), lon: +pos.coords.longitude.toFixed(4) };
        setCoords(c);
        lookupStores(`lat=${c.lat}&lon=${c.lon}`, (r) => {
          if (r.location.zip) setZip(r.location.zip);
        });
      },
      () => {
        setStoresLoading(false);
        setGeoError("We couldn't get your location — enter a ZIP code instead.");
      },
      { timeout: 10000, maximumAge: 600000 },
    );
  }

  async function culturize(override?: { dish?: string; zip?: string; mode?: "dish" | "paste"; style?: ShoppingStyle }) {
    const m = override?.mode ?? mode;
    const d = (override?.dish ?? dish).trim();
    const z = override?.zip ?? zip;
    const st = override?.style ?? style;
    if (m === "dish" && !d) {
      setError("Tell us what you'd like to cook.");
      setResult(null);
      return;
    }
    if (m === "paste" && !ingredientsText.trim()) {
      setError("Paste your family recipe's ingredients (one per line) first.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);
    setResult(null);
    setIngredientInfo(null);
    setMissingResult(null);
    setSavedId(null);
    setLoadingStep(0);
    const timer = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1100);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const res = await fetch("/api/culturize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: m,
          dish: d,
          cuisine: cuisine || undefined,
          zip: coords ? undefined : /^\d{5}$/.test(z) ? z : undefined,
          lat: coords?.lat,
          lon: coords?.lon,
          servings: servings ?? undefined,
          style: st,
          ingredientsText: m === "paste" ? ingredientsText : undefined,
          stepsText: m === "paste" ? stepsText : undefined,
        }),
      });
      const data = (await res.json()) as CulturizeResponse;
      if (data.ok) {
        setResult(data.recipe);
        if (m === "dish") {
          const params = new URLSearchParams({ dish: d });
          if (/^\d{5}$/.test(z)) params.set("zip", z);
          window.history.replaceState(null, "", `/kitchen?${params}`);
        }
      } else {
        if (m === "dish") {
          try {
            const lookupRes = await fetch(`/api/substitute?q=${encodeURIComponent(d)}`);
            if (lookupRes.ok) {
              const lookupData = (await lookupRes.json()) as { ok?: boolean; ingredient?: IngredientSearchResult };
              const found = lookupData.ingredient;
              if (lookupData.ok && found && found.kind !== "unknown") {
                setMode("ingredient");
                setIngredientQuery(d);
                setIngredientInfo(found);
                setError(null);
                window.history.replaceState(null, "", `/kitchen?mode=ingredient&ingredient=${encodeURIComponent(d)}`);
                return;
              }
            }
          } catch {
            /* show the original dish search error below */
          }
        }
        setError(data.error);
        setSuggestions(data.suggestions ?? []);
      }
    } catch {
      setError("We couldn't reach the kitchen. Check your connection and try again.");
    } finally {
      clearInterval(timer);
      setLoading(false);
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  // A shared, open-ended search covers dishes and ingredients.
  const typeaheadQuery = mode === "ingredient" ? ingredientQuery : mode === "missing" ? missingIngredient : dish;
  useEffect(() => {
    const q = typeaheadQuery.trim();
    if ((mode !== "dish" && mode !== "ingredient" && mode !== "missing") || q.length < 3 || /^https?:/i.test(q)) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dishes/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) setTypeahead(((await res.json()) as { suggestions: DishSuggestion[] }).suggestions);
      } catch {
        /* aborted */
      }
    }, 320);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [dish, ingredientQuery, mode, typeaheadQuery]);

  async function lookupIngredient(value = ingredientQuery) {
    const q = value.trim();
    if (!q) {
      setError("Type an ingredient to look it up.");
      return;
    }
    setIngredientQuery(q);
    setMode("ingredient");
    setLoading(true);
    setError(null);
    setResult(null);
    setMissingResult(null);
    setIngredientInfo(null);
    try {
      const res = await fetch(`/api/substitute?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { ok?: boolean; ingredient?: IngredientSearchResult; error?: string };
      if (!res.ok || !data.ok || !data.ingredient) throw new Error(data.error ?? "Couldn't find ingredient information.");
      setIngredientInfo(data.ingredient);
      const params = new URLSearchParams({ mode: "ingredient", ingredient: q });
      if (/^\d{5}$/.test(zip)) params.set("zip", zip);
      window.history.replaceState(null, "", `/kitchen?${params}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't look up that ingredient.");
    } finally {
      setLoading(false);
    }
  }

  async function findMissingSubstitute() {
    const d = dish.trim();
    const missing = missingIngredient.trim();
    if (!d) {
      setError("Tell us which dish you're making.");
      return;
    }
    if (!missing) {
      setError("Tell us which ingredient you don't have.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setIngredientInfo(null);
    setMissingResult(null);
    setSuggestions([]);
    try {
      const res = await fetch("/api/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dish: d,
          ingredient: missing,
          cuisine: cuisine || undefined,
          zip: coords ? undefined : /^\d{5}$/.test(zip) ? zip : undefined,
          lat: coords?.lat,
          lon: coords?.lon,
          style,
        }),
      });
      const data = (await res.json()) as MissingIngredientResponse;
      if (!res.ok || !data.ok) throw new Error("error" in data ? data.error : "Couldn't find a substitute.");
      setMissingResult(data);
      window.history.replaceState(null, "", "/kitchen?mode=missing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't find a substitute. Try another spelling.");
    } finally {
      setLoading(false);
    }
  }

  // Boot: restore ZIP, preview stores, and auto-run when arriving with a dish.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    let startZip = initialZip;
    if (!startZip) {
      try {
        startZip = localStorage.getItem(ZIP_KEY) ?? "";
      } catch {
        startZip = "";
      }
    }
    if (/^\d{5}$/.test(startZip)) {
      if (startZip !== initialZip) setZip(startZip);
      lookupStores(`zip=${startZip}`);
    }
    if (autoRun && initialDish && initialMode === "dish") void culturize({ dish: initialDish, zip: startZip });
    if (initialMode === "ingredient" && initialDish) void lookupIngredient(initialDish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: result }),
      });
      const data = (await res.json()) as { id?: number; error?: string };
      if (res.ok && data.id) setSavedId(data.id);
      else setError(data.error ?? "Couldn't save this recipe.");
    } catch {
      setError("Couldn't save this recipe.");
    } finally {
      setSaving(false);
    }
  }

  function pickDish(name: string) {
    setMode("dish");
    setDish(name);
    void culturize({ dish: name, mode: "dish" });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "ingredient") void lookupIngredient();
    else if (mode === "missing") void findMissingSubstitute();
    else void culturize();
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[400px_minmax(0,1fr)]">
      {/* Form */}
      <aside className="no-print self-start lg:sticky lg:top-24">
        <form onSubmit={onSubmit} className={`${card} p-5 sm:p-6`}>
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1 text-[12px] font-semibold sm:text-sm" role="tablist">
            {(
              [
                ["dish", "🍲 Find a dish"],
                ["ingredient", "🥬 Look up ingredient"],
                ["missing", "🔁 Missing ingredient"],
                ["paste", "📜 Paste recipe"],
              ] as const
            ).map(([key, text]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => setMode(key)}
                className={`rounded-xl px-3 py-2.5 transition ${mode === key ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {text}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {(mode === "dish" || mode === "missing") && (
              <div>
                <label htmlFor="dish" className={label}>
                  {mode === "missing" ? "What dish are you making?" : "What are you craving?"}
                </label>
                <input
                  id="dish"
                  list={mode === "dish" ? "kitchen-search-suggestions" : undefined}
                  value={dish}
                  onChange={(e) => setDish(e.target.value)}
                  placeholder={mode === "missing" ? "e.g. moong dal tadka" : "Any dish, from any cuisine — or paste a recipe link"}
                  className={input}
                  autoComplete="off"
                />
                {mode === "dish" && (
                  <p className="mt-1.5 text-xs text-muted">
                    {aiEnabled ? "✨ AI is on. " : ""}Search any dish. We check recipes across the web and cookbooks — not just a fixed menu.
                  </p>
                )}
              </div>
            )}

            {(mode === "dish" || mode === "ingredient" || mode === "missing") && (
              <datalist id="kitchen-search-suggestions">
                {typeahead.map((t) => (
                  <option key={`${t.kind}-${t.source}-${t.name}`} value={t.name} label={`${t.kind === "ingredient" ? "🥬 Ingredient" : "🍲 Dish"} · ${t.cuisine ?? t.source}`} />
                ))}
                {mode === "dish" && dishes.map((d) => <option key={d.id} value={d.name} label={`🍲 ${d.cuisine}`} />)}
              </datalist>
            )}

            {mode === "ingredient" && (
              <div>
                <label htmlFor="ingredient-query" className={label}>Ingredient, staple or food name</label>
                <input
                  id="ingredient-query"
                  list="kitchen-search-suggestions"
                  value={ingredientQuery}
                  onChange={(e) => setIngredientQuery(e.target.value)}
                  placeholder="e.g. moong dal, shatkora, epazote"
                  className={input}
                  autoComplete="off"
                />
                <p className="mt-1.5 text-xs text-muted">Look up what it is, where it comes from, a real reference photo and possible swaps.</p>
              </div>
            )}

            {mode === "missing" && (
              <div>
                <label htmlFor="missing-ingredient" className={label}>What ingredient don&apos;t you have?</label>
                <input
                  id="missing-ingredient"
                  list="kitchen-search-suggestions"
                  value={missingIngredient}
                  onChange={(e) => setMissingIngredient(e.target.value)}
                  placeholder="e.g. moong dal, kaffir lime leaves, fenugreek"
                  className={input}
                  autoComplete="off"
                />
                <p className="mt-1.5 text-xs text-muted">We&apos;ll use the dish and local stores to choose a fitting substitute.</p>
              </div>
            )}

            {mode === "paste" && (
              <>
                <div>
                  <label htmlFor="ingredients" className={label}>
                    Ingredients · one per line
                  </label>
                  <textarea
                    id="ingredients"
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    rows={7}
                    placeholder={PASTE_EXAMPLE}
                    className={`${input} font-mono text-[13px] leading-relaxed`}
                  />
                  <button
                    type="button"
                    onClick={() => setIngredientsText(PASTE_EXAMPLE)}
                    className="mt-1 text-xs font-semibold text-paprika hover:underline"
                  >
                    Use an example list
                  </button>
                </div>
                <div>
                  <label htmlFor="steps" className={label}>
                    Steps · optional
                  </label>
                  <textarea
                    id="steps"
                    value={stepsText}
                    onChange={(e) => setStepsText(e.target.value)}
                    rows={4}
                    placeholder="Paste the method and we'll note every swap inside it."
                    className={`${input} text-[13px] leading-relaxed`}
                  />
                </div>
              </>
            )}

            {mode !== "ingredient" && <div>
              <label htmlFor="cuisine" className={label}>
                Home cuisine · optional
              </label>
              <select id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} className={input}>
                <option value="">Any / let Culturize figure it out</option>
                {CUISINE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>}

            <div>
              <label htmlFor="zip" className={label}>
                Where do you shop?
              </label>
              <div className="flex gap-2">
                <input
                  id="zip"
                  value={coords ? `📍 ${stores?.location.label ?? "Current location"}` : zip}
                  onChange={(e) => onZipChange(e.target.value)}
                  onFocus={() => {
                    if (coords) onZipChange(zip);
                  }}
                  inputMode="numeric"
                  placeholder="ZIP code"
                  className={input}
                />
                <button
                  type="button"
                  onClick={locateMe}
                  className="shrink-0 rounded-2xl border border-clay bg-white px-3 text-sm font-semibold text-ink transition hover:bg-sand"
                  title="Use my location"
                >
                  📍 Locate
                </button>
              </div>
              {geoError && <p className="mt-1.5 text-xs text-paprika">{geoError}</p>}
              <div className="mt-3 min-h-6">
                {storesLoading ? (
                  <div className="flex flex-wrap gap-2" aria-live="polite">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-7 w-28 animate-pulse rounded-full bg-sand" />
                    ))}
                    <span className="sr-only">Finding stores…</span>
                  </div>
                ) : stores ? (
                  <div className="rounded-2xl bg-sand/60 p-3">
                    <p className="text-xs font-semibold text-ink">
                      {stores.source === "osm"
                        ? `${stores.stores.length} stores mapped near ${stores.location.label}`
                        : `Common chains near ${stores.location.label}`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {stores.stores.slice(0, 8).map((s) => (
                        <StoreChip key={s.id} store={s} />
                      ))}
                    </div>
                    {stores.note && <p className="mt-2 text-[11px] leading-snug text-muted">{stores.note}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-muted">Add your ZIP to see the grocery stores and markets near you.</p>
                )}
              </div>
            </div>

            {mode !== "ingredient" && <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={label}>Servings</span>
                <div className="flex items-center justify-between rounded-2xl border border-clay bg-white px-2 py-1.5">
                  <button
                    type="button"
                    aria-label="Fewer servings"
                    onClick={() => setServings((s) => Math.max(1, (s ?? 4) - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full text-lg hover:bg-sand"
                  >
                    −
                  </button>
                  <span className="text-sm font-semibold">{servings ?? "Auto"}</span>
                  <button
                    type="button"
                    aria-label="More servings"
                    onClick={() => setServings((s) => Math.min(24, (s ?? 4) + 1))}
                    className="grid h-8 w-8 place-items-center rounded-full text-lg hover:bg-sand"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <span className={label}>Engine</span>
                <div className="rounded-2xl border border-clay bg-white px-3 py-2.5 text-sm font-semibold">
                  {aiEnabled ? "✨ AI + library" : "🌶️ Flavor engine"}
                </div>
              </div>
            </div>}

            {mode !== "ingredient" && <fieldset>
              <legend className={label}>Shopping style</legend>
              <div className="grid gap-2">
                {(
                  [
                    ["authentic", "🧭 Authentic first", "Use the real thing from specialty markets nearby when we can."],
                    ["one-stop", "🛒 One-stop shop", "Everything from a single store, with smart swaps."],
                  ] as const
                ).map(([key, title, desc]) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition ${
                      style === key ? "border-paprika bg-paprika/5" : "border-clay bg-white hover:bg-sand/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="style"
                      value={key}
                      checked={style === key}
                      onChange={() => setStyle(key)}
                      className="mt-1 accent-paprika"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="block text-xs text-muted">{desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>}

            <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-3.5 text-[15px]`}>
              {loading
                ? mode === "ingredient" ? "Looking it up…" : mode === "missing" ? "Finding a substitute…" : "Culturizing…"
                : mode === "ingredient" ? "Look up ingredient" : mode === "missing" ? "Find my substitute" : "Culturize my recipe"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </form>
      </aside>

      {/* Results */}
      <section ref={resultsRef} className="min-w-0 scroll-mt-24" aria-live="polite">
        {loading ? (
          <div className={`${card} p-6 sm:p-8`}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-saffron-soft border-t-paprika" />
              <div>
                <p className="font-display text-2xl font-semibold">
                  {mode === "ingredient" ? `Looking up ${ingredientQuery || "ingredient"}…` : mode === "missing" ? "Finding a dish-specific substitute…" : `Culturizing ${mode === "dish" ? dish || "your dish" : dish || "your family recipe"}…`}
                </p>
                <p className="text-sm text-muted">
                  {coords
                    ? "Checking stores around your location"
                    : /^\d{5}$/.test(zip)
                      ? `Checking stores near ${zip}`
                      : "Using common grocery chains"}
                </p>
              </div>
            </div>
            <ol className="mt-8 space-y-2.5">
              {LOADING_STEPS.map((s, i) => (
                <li
                  key={s.text}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    i < loadingStep
                      ? "bg-herb-soft/60 text-herb"
                      : i === loadingStep
                        ? "bg-saffron-soft font-semibold text-ink"
                        : "text-muted/60"
                  }`}
                >
                  <span className="w-5 text-center">{i < loadingStep ? "✓" : s.icon}</span>
                  {s.text}
                  {i === loadingStep && (
                    <span className="ml-auto flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-paprika" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-paprika [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-paprika [animation-delay:240ms]" />
                    </span>
                  )}
                </li>
              ))}
            </ol>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-sand" />
              ))}
            </div>
          </div>
        ) : mode === "ingredient" && ingredientInfo ? (
          <IngredientLookupPanel result={ingredientInfo} />
        ) : mode === "missing" && missingResult ? (
          <MissingSwapPanel result={missingResult} />
        ) : result ? (
          <RecipeView
            recipe={result}
            actions={
              <>
                {savedId ? (
                  <Link href={`/recipes/${savedId}`} className={btnPrimary}>
                    Saved ✓ View in cookbook
                  </Link>
                ) : (
                  <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
                    {saving ? "Saving…" : "♥ Save to cookbook"}
                  </button>
                )}
                <button type="button" onClick={() => window.print()} className={btnSecondary}>
                  🖨 Print
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next: ShoppingStyle = style === "authentic" ? "one-stop" : "authentic";
                    setStyle(next);
                    void culturize({ style: next });
                  }}
                  className={btnSecondary}
                >
                  {style === "authentic" ? "🛒 Try one-stop shop" : "🧭 Try authentic first"}
                </button>
              </>
            }
          />
        ) : error ? (
          <div className={`${card} p-6 sm:p-8`}>
            <p className="text-4xl">🧑‍🍳</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{error}</h2>
            {suggestions.length > 0 ? (
              <>
                <p className="mt-2 text-muted">Here are the closest dishes in our kitchen right now:</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {suggestions.map((s) => (
                    <DishCard key={s.id} dish={s} compact onClick={() => pickDish(s.name)} />
                  ))}
                </div>
                <div className="mt-8 rounded-2xl bg-saffron-soft/60 p-5">
                  <p className="font-semibold">Have the recipe written down?</p>
                  <p className="mt-1 text-sm text-muted">
                    Paste its ingredient list and we&apos;ll culturize every line against the stores near you.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("paste");
                      setError(null);
                      setSuggestions([]);
                    }}
                    className={`${btnPrimary} mt-4`}
                  >
                    📜 Paste my family recipe
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-2 text-muted">Adjust the form and try again.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`${card} relative overflow-hidden p-6 sm:p-8`}>
              <div className="bg-dots absolute inset-0 opacity-50" />
              <div className="relative">
                <p className="text-4xl">{mode === "ingredient" ? "🥬" : mode === "missing" ? "🔁" : "🍳"}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold">
                  {mode === "ingredient" ? "Look up an ingredient from anywhere" : mode === "missing" ? "Tell us what you don't have" : "Search any dish in the world"}
                </h2>
                <p className="mt-2 max-w-2xl text-muted">
                  {mode === "ingredient"
                    ? "The ingredient library is a starting point, not a limit. We also search a broad food encyclopedia and show source links and real reference photos."
                    : mode === "missing"
                      ? "Name the meal, the ingredient you're missing and your ZIP. We'll check flavor-matched swaps and nearby stores."
                      : "Type a dish name, cuisine, or paste a recipe link. We search the kitchen library, worldwide recipe databases, cookbooks and the open web."}
                </p>
                {mode === "dish" && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setMode("ingredient")} className="rounded-full border border-clay bg-white px-4 py-2 text-sm font-semibold hover:border-paprika hover:text-paprika">🥬 Look up an ingredient</button>
                    <button type="button" onClick={() => setMode("missing")} className="rounded-full border border-clay bg-white px-4 py-2 text-sm font-semibold hover:border-paprika hover:text-paprika">🔁 I&apos;m missing an ingredient</button>
                    <button type="button" onClick={() => setMode("paste")} className="rounded-full border border-clay bg-white px-4 py-2 text-sm font-semibold hover:border-paprika hover:text-paprika">📜 Paste a family recipe</button>
                  </div>
                )}
              </div>
            </div>
            {mode === "dish" && suggestions.length > 0 && (
              <div className={`${card} p-5`}>
                <p className="font-semibold">Closest recipe matches</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {suggestions.map((suggestion) => <DishCard key={suggestion.id} dish={suggestion} compact onClick={() => pickDish(suggestion.name)} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
