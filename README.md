# Boostie Career Portal

A modern, white-label job board for staffing and recruiting firms running Bullhorn ATS. Forked from [bullhorn/career-portal](https://github.com/bullhorn/career-portal) and rebuilt from the ground up — no proprietary UI dependencies, no legacy framework debt, and first-class support for [Boostie](https://boostie.com) apply flows.

---

## Why this fork exists

The original Bullhorn career portal is built on Angular 10 and a proprietary component library (`novo-elements`) that is tightly coupled to Bullhorn's internal design system. This makes it difficult to customize, hard to maintain, and slow to update.

This fork replaces the entire UI layer with Tailwind CSS utility classes and standard Angular patterns, making the portal:

- **Easy to white-label** — change logo, colors, and copy through config and CSS variables, no component library to fight
- **Easy to deploy** — configure entirely through environment variables, no code edits required per client
- **Boostie-ready** — when a Boostie client ID is present, the portal automatically injects the Boostie script and wires up the apply experience end-to-end

---

## What changed from the original

| | Original | This fork |
|---|---|---|
| Framework | Angular 10 | Angular 18 (standalone components) |
| UI library | `novo-elements` (proprietary) | Tailwind CSS |
| Icons | `bullhorn-icons` / `bhi-*` | `lucide-angular` |
| Forms | `novo-form` | Angular Reactive Forms |
| SSR | `@nguniversal` | `@angular/ssr` (built-in) |
| Node | 16 | 20 LTS |
| Linting | tslint | ESLint + angular-eslint |
| Config | Edit JSON files | Environment variables |

---

## Prerequisites

- Node.js 20+
- npm 9+
- A Bullhorn ATS account with a public `corpToken` and `swimlane`
- (Optional) A Boostie account with a `clientId`

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/boostie-talent/career-portal.git
cd career-portal
npm install
```

### 2. Configure

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```bash
COMPANY_NAME=Your Company Name
COMPANY_WEBSITE=https://yourcompany.com
COMPANY_LOGO_URL=./assets/logo.png
BULLHORN_SWIMLANE=91
BULLHORN_CORP_TOKEN=your_corp_token
BOOSTIE_CLIENT_ID=your-boostie-client-id   # omit or leave blank to disable
```

> **Finding your Bullhorn credentials:** `corpToken` and `swimlane` are visible in your Bullhorn ATS admin panel under API settings. The `corpToken` is the short alphanumeric code used in public REST API URLs.

### 3. Write config and run

```bash
npm run configure   # writes .env values into the build config
npm run serve       # dev server at http://localhost:4200
```

---

## Building for production

### Static (S3, Netlify, Vercel, CDN)

```bash
npm run configure
npm run build:static
# deploy dist/career-portal/browser/
```

### SSR / Express (Docker, Railway, Render, etc.)

```bash
npm run build
# set env vars in your hosting environment, then:
npm start
```

For SSR deployments, env vars are read at server startup — no `npm run configure` step needed. Set them directly in your hosting dashboard or container environment.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `COMPANY_NAME` | Yes | Displayed in the nav bar |
| `COMPANY_WEBSITE` | Yes | Company URL — shown as nav link |
| `COMPANY_LOGO_URL` | Yes | Path or URL to logo (any image format) |
| `BULLHORN_SWIMLANE` | Yes | Bullhorn swimlane number |
| `BULLHORN_CORP_TOKEN` | Yes | Bullhorn public corp token |
| `HOSTED_ENDPOINT` | No | Public URL of this portal (used in sitemaps/RSS) |
| `BOOSTIE_CLIENT_ID` | No | Boostie client ID — enables Boostie apply flow |
| `GOOGLE_ANALYTICS_TRACKING_ID` | No | GA tracking ID |
| `GOOGLE_VERIFICATION_CODE` | No | Google Search Console verification code |
| `PORT` | No | Server port for SSR (default `4000`) |
| `ALLOWED_HOST` | No | Additional allowed hostname for SSRF mitigation |

---

## Boostie integration

When `BOOSTIE_CLIENT_ID` is set, the portal:

1. Injects the Boostie script into `<head>` at app boot (browser-only, SSR-safe)
2. Renders a `<button id="job-apply">` on each job detail page for Boostie to wire up
3. Renders a hidden `<div id="jobId">` so Boostie's script can identify the Bullhorn job
4. Suppresses the native Bullhorn apply modal entirely — Boostie owns the apply experience

To disable Boostie and use the native Bullhorn apply flow, omit `BOOSTIE_CLIENT_ID` or set it to empty.

---

## Adding a logo

Drop your logo file into `src/assets/` and point `COMPANY_LOGO_URL` at it:

```bash
# any format works
COMPANY_LOGO_URL=./assets/logo.png
COMPANY_LOGO_URL=./assets/logo.svg
COMPANY_LOGO_URL=./assets/logo.webp
```

The nav constrains the image to `28px` tall (`h-7`) with `w-auto` to preserve aspect ratio — any size source file renders correctly.

---

## Build modes

| Mode | Command | Use case |
|---|---|---|
| `static` | `npm run build:static` | Browser-only bundle for CDN/static hosting |
| `dynamic` | `npm run build` | Express + SSR bundle |
| `qa` | `npm run build:qa` | QA environment |

---

## Project structure

```
src/
├── app/
│   ├── app.component.*          # Root shell — nav + footer
│   ├── app.routes.ts            # Routes (lazy-loaded)
│   ├── app.config.ts            # App providers, i18n, settings init
│   ├── footer/                  # Footer — customize here
│   ├── job-list/                # Job card grid
│   ├── job-details/             # Job detail + apply CTA
│   ├── apply-modal/             # Native Bullhorn apply form (non-Boostie)
│   ├── sidebar/                 # Filter sidebar
│   │   └── sidebar-filter/      # Individual filter group (category/state/city)
│   ├── main-page/               # Two-column layout + search bar
│   ├── privacy-policy/          # Static privacy page
│   ├── services/
│   │   ├── settings/            # Loads app.json config at boot
│   │   ├── search/              # Bullhorn search API
│   │   └── apply/               # Bullhorn apply API (native flow only)
│   └── typings/settings.d.ts    # ISettings interface
├── assets/                      # Static assets (logo, etc.)
├── configuration/
│   ├── static/app.json          # Config for static builds ← edit this for dev
│   ├── dynamic/app.json         # Config for SSR builds
│   └── qa/app.json              # Config for QA builds
└── static/i18n/                 # Translation files (en, fr, es, de, ...)
scripts/
└── generate-config.js           # Writes env vars into config JSON
```

---

## Clean URLs (removing the `#` from links)

By default, static builds use Angular's hash-based routing (`/#/jobs/...`). This works on any static host without configuration, but isn't ideal for sharing or SEO.

To get clean URLs (`/jobs/...`), you need **one redirect rule** that tells your host to serve `index.html` for all paths. The Angular change is a one-liner — remove `withHashLocation()` from the router config in `src/app/app.config.ts`.

### Netlify

Add `public/_redirects`:

```
/*  /index.html  200
```

### Vercel

Add `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### S3 + CloudFront

In your CloudFront distribution, add a custom error response:
- HTTP error code: `403` and `404`
- Response page path: `/index.html`
- HTTP response code: `200`

### SSR / Express build

No changes needed — the Express server already handles all routes and returns `index.html`. Hash routing is only used in the static build.

---

## Credits

Original open-source portal by [Bullhorn](https://github.com/bullhorn/career-portal).  
Rebuilt and maintained by [Boostie](https://boostie.com).
