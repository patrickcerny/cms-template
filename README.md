# cms-template

A minimal, multilingual Next.js starter with a built-in content editor. No
database — content lives in JSON and is edited from a password-protected admin
page.

- **Next.js 16 + React 19**, TypeScript, Sass modules
- **i18n** with locale-prefixed routes (`/en`, `/de`, …) and a default locale
- **File-based CMS**: defaults in `src/i18n/*.json`, overrides edited at `/admin`
- **Pages**: Home, About, Contact, Legal (privacy/terms) — all content-editable
- Neutral, unbranded styling driven by design tokens

## Quick start

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
```

Edit content at [http://localhost:3000/admin](http://localhost:3000/admin).

## Make it yours

1. Set `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME` in
   `.env.local`.
2. Replace the placeholder copy in `src/i18n/en.json` / `de.json` (or edit it
   from `/admin`).
3. Re-theme by editing the tokens in `src/styles/_tokens.scss`.

## How it all works

See [AGENTS.md](AGENTS.md) for a full tour: the content/merge system, i18n,
routing, the admin editor, components, styling, SEO, and deployment.
