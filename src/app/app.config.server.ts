import {
  mergeApplicationConfig,
  ApplicationConfig,
  importProvidersFrom,
  TransferState,
} from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { appConfig } from './app.config';
import { ServerTranslationLoader } from './services/localization/server-loader';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: ServerTranslationLoader,
          deps: [TransferState],
        },
      }),
    ),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
