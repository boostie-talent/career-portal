# Boostie Career Portal

A modern, white-label career portal for staffing and recruiting firms using Bullhorn ATS, with first-class Boostie integration. Forked from [bullhorn/career-portal](https://github.com/bullhorn/career-portal) and rebuilt from the ground up.

---

## What's different from the original

| | Original | This fork |
|---|---|---|
| Framework | Angular 10 | Angular 18 (standalone components) |
| UI library | `novo-elements` (proprietary Bullhorn) | Tailwind CSS |
| Icons | `bullhorn-icons` / `bhi-*` | `lucide-angular` |
| Forms | `novo-form` | Angular Reactive Forms |
| SSR | `@nguniversal` | `@angular/ssr` (built-in) |
| Node | 16 | 20 LTS |
| Linting | tslint | ESLint + angular-eslint |

---

## Boostie integration

When `boostie.clientId` is set in `app.json`, the portal:

1. Injects the Boostie script into `<head>` at app boot (browser-only, SSR-safe)
2. Renders a `<button id="job-apply">` on the job detail page for Boostie to wire up
3. Renders a hidden `<div id="jobId">` so Boostie's script can identify the Bullhorn job
4. Suppresses the native Bullhorn apply modal — Boostie owns the entire apply experience

```json
{
  "boostie": {
    "clientId": "your-client-id-here"
  }
}
```

Set `clientId` to `null` to disable Boostie and use the native Bullhorn apply flow.

---

## Configuration (`src/app.json`)

| Field | Description |
|---|---|
| `companyName` | Displayed in the nav bar |
| `companyLogoPath` | Path to logo (e.g. `./assets/logo.svg`) |
| `companyUrl` | Company website — shown as a nav link |
| `service.corpToken` | Bullhorn corp token |
| `service.swimlane` | Bullhorn swimlane number |
| `boostie.clientId` | Boostie client ID (`null` to disable) |

---

## Getting started

Requires Node 20+.

```bash
npm install
npm run serve        # Dev server (static, no SSR) at http://localhost:4200
```

---

## Build modes

| Mode | Command | Output |
|---|---|---|
| `static` | `ng build --configuration=static` | Browser-only, for S3 / Netlify / CDN |
| `dynamic` | `ng build --configuration=dynamic` | Express + SSR |
| `qa` | `ng build --configuration=qa` | QA environment |

Static builds go to `dist/career-portal/browser/`.

---

## Deploying with SSR

Build with `--configuration=dynamic`, then run:

```bash
node dist/career-portal/server/server.mjs
```

Environment variables override `app.json` values at runtime:

| Variable | Maps to |
|---|---|
| `COMPANY_NAME` | `companyName` |
| `COMPANY_WEBSITE` | `companyUrl` |
| `COMPANY_LOGO_URL` | `companyLogoPath` |
| `BULLHORN_SWIMLANE` | `service.swimlane` |
| `BULLHORN_CORP_TOKEN` | `service.corpToken` |
| `HOSTED_ENDPOINT` | `careersUrl` |
| `GOOGLE_ANALYTICS_TRACKING_ID` | `integrations.googleAnalytics.trackingId` |
| `GOOGLE_VERIFICATION_CODE` | `integrations.googleSiteVerification.verificationCode` |
| `ALLOWED_HOST` | Additional allowed hostname for SSRF mitigation |
| `PORT` | Server port (default `4000`) |

---

## Credits

Original open-source portal by [Bullhorn](https://github.com/bullhorn/career-portal).  
Rebuilt and maintained by [Boostie](https://boostie.com).
