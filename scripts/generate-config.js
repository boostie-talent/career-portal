#!/usr/bin/env node
/**
 * Generates src/configuration/static/app.json from environment variables.
 * Run before `ng build --configuration=static` when using env-var-based config.
 *
 * Usage:
 *   node scripts/generate-config.js
 *   # or via npm script:
 *   npm run configure
 */

const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../src/configuration/static/app.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const mappings = {
  COMPANY_NAME:                   (c, v) => { c.companyName = v; },
  COMPANY_WEBSITE:                (c, v) => { c.companyUrl = v; },
  COMPANY_LOGO_URL:               (c, v) => { c.companyLogoPath = v; },
  HOSTED_ENDPOINT:                (c, v) => { c.careersUrl = v; },
  BULLHORN_SWIMLANE:              (c, v) => { c.service.swimlane = v; },
  BULLHORN_CORP_TOKEN:            (c, v) => { c.service.corpToken = v; },
  BOOSTIE_CLIENT_ID:              (c, v) => { if (!c.boostie) c.boostie = {}; c.boostie.clientId = v || null; },
  GOOGLE_ANALYTICS_TRACKING_ID:  (c, v) => { c.integrations.googleAnalytics.trackingId = v; },
  GOOGLE_VERIFICATION_CODE:      (c, v) => { c.integrations.googleSiteVerification.verificationCode = v; },
  TELEMETRY_DISABLED:            (c, v) => { if (!c.telemetry) c.telemetry = {}; c.telemetry.disabled = v === 'true'; },
  TELEMETRY_ENDPOINT:            (c, v) => { if (!c.telemetry) c.telemetry = {}; c.telemetry.endpoint = v; },
};

let changed = 0;
for (const [envVar, apply] of Object.entries(mappings)) {
  const value = process.env[envVar];
  if (value !== undefined) {
    apply(config, value);
    console.log(`  ✓ ${envVar}`);
    changed++;
  }
}

if (changed === 0) {
  console.log('No environment variables set — config unchanged.');
} else {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\nWrote ${configPath}`);
}
