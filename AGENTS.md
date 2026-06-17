# AGENTS.md

How this codebase works. Read this before changing anything.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**, TypeScript.
- **Sass** via CSS Modules (`*.module.scss`) plus a small global stylesheet.
- No database. Content lives in JSON files on disk.
- Path alias: `@/*` → `src/*`.

Commands:

```bash
npm install     # install dependencies
npm run dev     # dev server (http://localhost:3000)
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

## How content works

Content is a two-layer system: **defaults in code** + **overrides on disk**.

1. **Defaults** live in `src/i18n/en.json` and `src/i18n/de.json`. These are the
   shipped copy and the source of truth for the content *shape*.
2. **Overrides** are written by the admin editor to `data/site-content.json`
   (git-ignored). This file is a partial, per-locale patch.
3. `src/lib/cms-dictionary.ts` merges them: `getCmsDictionary(locale)` deep-merges
   the on-disk overrides over the default dictionary. `saveCmsContent(content)`
   writes the overrides file. The merge replaces arrays wholesale and merges
   objects key by key (`mergeDeep`).

Every page calls `getCmsDictionary(locale)` and reads its slice (e.g.
`getCmsDictionary(locale).home`). Pages are statically generated, so after an edit
the admin action calls `revalidatePath(...)` to regenerate the affected routes
with the new content.

**The `Dictionary` type is `typeof en.json`.** Editing `en.json`'s structure changes
the TypeScript type used everywhere. Keep all locale files structurally identical.

## Internationalization

- Configured in `src/i18n/config.ts`. `locales` is the list of supported codes;
  **the first entry is the default** (`defaultLocale`). Currently `["en", "de"]`.
- Routes are nested under `src/app/[locale]/...`, so every page is
  `/{locale}/...`. `localizedPath(locale, "/about")` builds locale-prefixed hrefs.
- `isLocale(value)` guards the `[locale]` param; pages call `notFound()` on a bad
  locale. `generateStaticParams` in the layout prerenders one tree per locale.
- On startup, `config.ts` runs `assertMatchingShape` to verify every dictionary
  has the **exact same keys and array lengths** as `en.json`. A drifted
  translation throws immediately with the offending path. This is intentional —
  it keeps the editor and types correct.
- The bare root `/` redirects to `/{defaultLocale}` via `next.config.ts`
  (`DEFAULT_LOCALE` there must match `defaultLocale`).

### Add a language

1. Add the code to `locales` in `src/i18n/config.ts` (e.g. `"fr"`).
2. Create `src/i18n/fr.json` by copying `en.json` and translating values —
   keep the structure identical.
3. Register it in the `dictionaries` map in `config.ts`.

The header language switch, footer, metadata `alternates`, and the admin editor
all iterate over `locales`, so they pick up the new language automatically.

## Routing & pages

All under `src/app/[locale]/`:

| Route | File | Renders |
|-------|------|---------|
| `/{locale}` | `page.tsx` | Home: hero, metrics, feature cards, quote, CTA |
| `/{locale}/about` | `about/page.tsx` | `PageIntro` + body paragraphs |
| `/{locale}/contact` | `contact/page.tsx` | `ContactPage` component |
| `/{locale}/legal/{slug}` | `legal/[slug]/page.tsx` | `LegalPage`; `slug` ∈ `privacy`, `terms` |

`src/app/[locale]/layout.tsx` wraps every page with `<Header>`, `<main>`,
`<Footer>`, the JSON-LD `<SchemaOrg>`, and imports the global `base.scss`. It also
builds page metadata.

### Add a page

1. Create `src/app/[locale]/<name>/page.tsx`. Read content with
   `getCmsDictionary(locale)`, export `generateMetadata` using `buildMetadata`.
2. Add the copy to `en.json` / `de.json` (and any other locales).
3. Add a nav link in `src/components/layout/Header/Header.tsx` and/or `Footer.tsx`
   using `localizedPath`.
4. To make it editable in the admin, add fields to `SiteContentEditor.tsx`
   (see below).
5. Add the route to `revalidateSitePages()` in `src/app/admin/actions.ts` so edits
   regenerate it.

## Admin / CMS editor

- Lives at `/admin` (`src/app/admin/`), excluded from indexing via
  `next.config.ts` headers and the page metadata.
- **Auth** (`actions.ts`): password-only. `ADMIN_PASSWORD` env var (default
  `changeme`). A SHA-256 token of the password is stored in an httpOnly cookie
  scoped to `/admin`, valid 8 hours. `loginAction` / `logoutAction` manage it;
  `isAdminAuthenticated()` gates the page and the save action.
- **Editor** (`SiteContentEditor.tsx`): a structured form, not a raw JSON box. It
  loads the merged dictionary for **every locale at once**, lets you edit each
  field per locale side by side, and serializes the whole content object into a
  hidden `contentJson` input. `saveSiteContentAction` parses it, calls
  `saveCmsContent`, then `revalidatePath`s the public routes.
- The editor is organized into sections (`General`, `Home`, `About`, `Contact`,
  `Legal`). Arrays (metrics, feature cards, about paragraphs, address lines, legal
  sections/paragraphs) use add/remove controls with soft caps defined in the
  `caps` object. Array edits apply across all locales together so lengths stay in
  sync (required by the shape assertion).
- Field helpers: `field(label, path, textarea?)` renders one input per locale at a
  deep `path`; `setShared` writes the same value to every locale (used for
  non-translatable values like a feature card's `icon`). `getDeepValue` /
  `setDeepValue` do immutable deep reads/writes by path.

### Add an editable content field

1. Add the key to every locale JSON (`en.json`, `de.json`, …).
2. Render it on the relevant page from `getCmsDictionary(locale)`.
3. In `SiteContentEditor.tsx`, add `{field("Label", ["path", "to", "key"])}`
   inside the right `Panel` (or an `ArrayPanel` for lists).

## Components

- `src/components/layout/Header` — sticky header, primary nav, language switch,
  mobile drawer. Client component (`usePathname`, menu state).
- `src/components/layout/Footer` — brand, nav, legal links, copyright.
- `src/components/ui/ArrowLink` — the standard button/link (`filled` / `outline`).
- `src/components/ui/PageIntro` — eyebrow + title + description page header.
- `src/components/ui/Reveal` — wraps children in an IntersectionObserver fade-in.
  Client component; respects `prefers-reduced-motion`.
- `src/components/pages/ContactPage`, `.../LegalPage` — presentational, take plain
  props sliced from the dictionary.
- `src/components/SchemaOrg` — renders one or more JSON-LD `<script>` blocks.

## Styling

- Tokens in `src/styles/_tokens.scss`: colors, type, layout sizes, breakpoints.
  **Re-theme the whole site by editing these.** The default theme is a neutral
  light palette with one accent color.
- `src/styles/_mixins.scss`: `container` (centered max-width wrapper) and `eyebrow`
  (small uppercase label). Import with `@use "@/styles/mixins" as *;`.
- `src/app/base.scss`: global resets and base element styles, imported once in the
  layouts.
- Everything else is colocated `*.module.scss` per component. Each module imports
  tokens/mixins as needed.

## SEO

`src/lib/seo.ts`:

- `buildMetadata({ title, description, locale, path?, keywords?, ogImage?, noIndex? })`
  returns a Next `Metadata` object with canonical URL, `alternates.languages` for
  every locale, Open Graph, and Twitter card. Used in each page's
  `generateMetadata`.
- `organizationSchema()` returns JSON-LD rendered site-wide via `<SchemaOrg>` in
  the layout.
- `SITE_URL`, `SITE_NAME`, `OG_IMAGE` read from `NEXT_PUBLIC_*` env vars with
  fallbacks.

## Environment

Copy `.env.example` to `.env.local`:

- `ADMIN_PASSWORD` — password for `/admin`. **Change before deploying.**
- `NEXT_PUBLIC_SITE_URL` — absolute site URL for canonical/OG links.
- `NEXT_PUBLIC_SITE_NAME` — name used in metadata and JSON-LD.
- `NEXT_PUBLIC_OG_IMAGE` — optional OG image path under `/public`.

## Deployment

- `npm run build` then `npm start`, or use the `Dockerfile`.
- `data/site-content.json` is written at runtime. In containers, mount a volume at
  `/app/data` (the Dockerfile declares it) so admin edits persist across restarts.
- Set `ADMIN_PASSWORD` and `NEXT_PUBLIC_SITE_URL` in the deployment environment.
