import {
  ApplicationConfig,
  APP_INITIALIZER,
  importProvidersFrom,
  TransferState,
} from '@angular/core';
import { provideRouter, withHashLocation, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient, withFetch, HttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { routes } from './app.routes';
import { SettingsService } from './services/settings/settings.service';
import { SearchService } from './services/search/search.service';
import { ApplyService } from './services/apply/apply.service';
import { AnalyticsService } from './services/analytics/analytics.service';
import { ShareService } from './services/share/share.service';
import { ServerResponseService } from './services/server-response/server-response.service';
import { JobResolver } from './job.resolver';
import { TranslationLoader } from './services/localization/loader';
import { environment } from '../environments/environment';

function initSettings(settings: SettingsService): () => Promise<void> {
  return () => settings.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      ...(environment.useHash ? [withHashLocation()] : []),
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslationLoader,
          deps: [HttpClient, TransferState],
        },
      }),
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initSettings,
      deps: [SettingsService],
      multi: true,
    },
    SettingsService,
    SearchService,
    ApplyService,
    AnalyticsService,
    ShareService,
    ServerResponseService,
    JobResolver,
    DatePipe,
  ],
};
