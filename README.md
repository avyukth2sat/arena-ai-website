# Culturize

A self-contained replica of the supplied Culturize website. The preview runs from this project locally; it does not need the reference site or external APIs to render.

## Run locally

Node.js 18+ is enough; there are no package dependencies.

```bash
npm start
```

The app listens on port 3000. You can also run `npm run dev`.

## Routes included

- `/` — Culturize landing page
- `/kitchen` — dish search
- `/kitchen?mode=ingredient`, `/kitchen?mode=missing`, `/kitchen?mode=paste` — Kitchen modes
- `/substitutes` — Ingredient Finder and featured swap searches
- `/recipes` — Community Cookbook, cuisine filters, and six recipe details at `/recipes/1` through `/recipes/6`

The local build includes the reference styles, fonts, photography, page copy, and a small client script for local navigation, searches, filters, recipe tabs, and shopping-list controls. It intentionally uses only content captured from the supplied reference pages; no live store inventory or geocoding provider was supplied.

For a live comparison against the supplied host instead of the self-contained version, start with `USE_REFERENCE_PROXY=1 node server.js`.
