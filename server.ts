import 'zone.js/node';

import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { join, resolve } from 'path';

import bootstrap from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync, readFileSync, writeFile } from 'fs';
import { ISettings } from './src/app/typings/settings';
import { generateRss, generateSitemap } from './generateXml';
import { REQUEST, RESPONSE } from './src/app/tokens';

const DIST_FOLDER: string = join(process.cwd(), 'dist/career-portal/browser');
let appConfig: ISettings = JSON.parse(readFileSync(join(DIST_FOLDER, 'app.json')).toString());

if (process.env.COMPANY_NAME) {
  appConfig.service.swimlane = process.env.BULLHORN_SWIMLANE as string;
  appConfig.service.corpToken = process.env.BULLHORN_CORP_TOKEN as string;
  appConfig.careersUrl = process.env.HOSTED_ENDPOINT as string;
  appConfig.companyName = process.env.COMPANY_NAME as string;
  appConfig.companyUrl = process.env.COMPANY_WEBSITE as string;
  appConfig.companyLogoPath = process.env.COMPANY_LOGO_URL as string;
  appConfig.integrations.googleAnalytics.trackingId = process.env.GOOGLE_ANALYTICS_TRACKING_ID as string;
  appConfig.integrations.googleSiteVerification.verificationCode = process.env.GOOGLE_VERIFICATION_CODE as string;
  if (!appConfig.boostie) appConfig.boostie = { clientId: null };
  appConfig.boostie.clientId = process.env.BOOSTIE_CLIENT_ID || null;
  if (!(appConfig as any).telemetry) (appConfig as any).telemetry = { disabled: false, endpoint: '' };
  if (process.env.TELEMETRY_DISABLED === 'true') (appConfig as any).telemetry.disabled = true;
  if (process.env.TELEMETRY_ENDPOINT) (appConfig as any).telemetry.endpoint = process.env.TELEMETRY_ENDPOINT;

  writeFile(resolve(DIST_FOLDER, 'app.json'), JSON.stringify(appConfig), (err: any) => {
    if (err) {
      // tslint:disable-next-line: no-console
      console.error('Failed to write config file:', err.message);
    }
  });
}

// Allowed hostnames for SSRF mitigation (GHSA-x288-3778-4hhx).
// Derived from careersUrl in app config; set ALLOWED_HOST env var for additional entries.
const allowedHostnames = new Set<string>(['localhost', '127.0.0.1']);
if (appConfig.careersUrl) {
  try {
    allowedHostnames.add(new URL(appConfig.careersUrl).hostname);
  } catch {
    // careersUrl is not a valid absolute URL; hostname cannot be derived automatically
  }
}
if (process.env.ALLOWED_HOST) {
  allowedHostnames.add(process.env.ALLOWED_HOST);
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server: any = express();
  const distFolder: string = join(process.cwd(), 'dist/career-portal/browser');

  // Security response headers
  server.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://trust-snippet.bullhornstaffing.com https://www.google-analytics.com https://api-us1.boostie.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.bullhornstaffing.com https://www.google-analytics.com https://api-us1.boostie.com https://hooks.attio.com",
        "object-src 'none'",
        "base-uri 'self'",
      ].join('; '),
    );
    next();
  });

  // SSRF mitigation: validate Host / X-Forwarded-* headers (GHSA-x288-3778-4hhx)
  server.use((req: any, res: any, next: any) => {
    const rawHost = (req.headers['x-forwarded-host'] ?? req.headers['host'])?.toString() ?? '';
    const hostname = rawHost.split(':')[0];
    const portHeader = req.headers['x-forwarded-port']?.toString();

    if (hostname && !allowedHostnames.has(hostname)) {
      return res.status(400).send('Bad Request');
    }
    if (portHeader && !/^\d+$/.test(portHeader)) {
      return res.status(400).send('Bad Request');
    }
    next();
  });

  const commonEngine = new CommonEngine();
  const indexHtml = join(distFolder, 'index.html');

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, { maxAge: '1y' }));

  server.get('/sitemap', (req: any, res: any) => {
    res.type('application/xml');
    generateSitemap(appConfig, res, req);
  });

  server.get('/feed', (req: any, res: any) => {
    res.type('application/xml');
    generateRss(appConfig, res, req);
  });

  // All regular routes rendered by Angular
  server.get('*', (req: any, res: any, next: any) => {
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${req.protocol}://${req.headers.host}${req.originalUrl}`,
        publicPath: distFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: req.baseUrl },
          { provide: REQUEST, useValue: req },
          { provide: RESPONSE, useValue: res },
        ],
      })
      .then((html: string) => res.send(html))
      .catch((err: Error) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env.PORT || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
