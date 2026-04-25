import { Component, OnInit, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { SettingsService } from './services/settings/settings.service';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public companyName: string = SettingsService.settings.companyName;
  public companyUrl: string = SettingsService.settings.companyUrl;
  public companyLogoPath: string = SettingsService.settings.companyLogoPath;

  constructor(
    private router: Router,
    private meta: Meta,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  public ngOnInit(): void {
    const settings = SettingsService.settings;

    if (settings.darkTheme) {
      this.renderer.addClass(this.document.documentElement, 'dark');
    }

    if (settings.integrations?.googleSiteVerification?.verificationCode) {
      this.meta.updateTag({
        name: 'google-site-verification',
        content: settings.integrations.googleSiteVerification.verificationCode,
      });
    }

    const trackingId = settings.integrations?.googleAnalytics?.trackingId;
    if (trackingId && isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          (window as any).ga?.('create', trackingId, 'auto');
          (window as any).ga?.('set', 'page', event.urlAfterRedirects);
          (window as any).ga?.('send', 'pageview');
        }
      });
    }

    if (isPlatformBrowser(this.platformId)) {
      this.injectBoostieScript();
    }
  }

  private injectBoostieScript(): void {
    const clientId = (SettingsService.settings as any).boostie?.clientId;
    if (!clientId) return;

    (window as any).bstClientId = clientId;
    (window as any).bstApiUrl = 'https://api-us1.boostie.com/';
    (window as any).bstAllVisitors = true;

    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.text = `(function(){var b=document.createElement('script');b.type='text/javascript';b.async=true;b.src=window.bstApiUrl+'/scripts/boostie.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(b,s);})();`;
    this.renderer.appendChild(this.document.head, script);
  }
}
