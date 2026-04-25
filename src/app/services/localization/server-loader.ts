import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { TransferState, makeStateKey, StateKey } from '@angular/core';
import { join } from 'path';
import { from, Observable } from 'rxjs';
import * as fs from 'fs';

@Injectable()
export class ServerTranslationLoader implements TranslateLoader {
  constructor(private transferState: TransferState) {}

  public getTranslation(locale: string): Observable<object> {
    const languageCode = (locale.split('-')[0] || '').toLowerCase();
    return from(this.getLanguageAndLocale(languageCode, locale));
  }

  private async translationFetcher(locale: string): Promise<object> {
    const assetsFolder = join(process.cwd(), 'dist', 'career-portal', 'browser', 'i18n');
    return JSON.parse(fs.readFileSync(`${assetsFolder}/${locale}.json`, 'utf8'));
  }

  private async getLanguageAndLocale(language: string, locale: string): Promise<object> {
    const languageKey: StateKey<object> = makeStateKey<object>('transfer-translate-' + language);
    const fallbackKey: StateKey<object> = makeStateKey<object>('transfer-translate-' + locale);

    let fallbackTranslations: object = {};
    let translations: object = {};

    try {
      fallbackTranslations = await this.translationFetcher(language);
      this.transferState.set(fallbackKey, fallbackTranslations);
    } catch { fallbackTranslations = {}; }

    try {
      translations = await this.translationFetcher(locale);
      this.transferState.set(languageKey, translations);
    } catch { translations = {}; }

    return { ...fallbackTranslations, ...translations };
  }
}
