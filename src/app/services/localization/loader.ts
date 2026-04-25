import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TransferState, makeStateKey, StateKey } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable, lastValueFrom } from 'rxjs';

@Injectable()
export class TranslationLoader implements TranslateLoader {
  constructor(private http: HttpClient, private transferState: TransferState) {}

  public getTranslation(locale: string): Observable<object> {
    const languageCode = (locale.split('-')[0] || '').toLowerCase();
    return from(this.getLanguageAndLocale(languageCode, locale));
  }

  private async translationFetcher(locale: string): Promise<object> {
    return lastValueFrom(this.http.get<object>(`i18n/${locale}.json`));
  }

  private async getLanguageAndLocale(language: string, locale: string): Promise<object> {
    const languageKey: StateKey<object> = makeStateKey<object>('transfer-translate-' + language);
    const fallbackKey: StateKey<object> = makeStateKey<object>('transfer-translate-' + locale);

    let fallbackTranslations: object = {};
    let translations: object = {};

    try {
      fallbackTranslations = this.transferState.get(fallbackKey, null) ?? await this.translationFetcher(language);
    } catch { fallbackTranslations = {}; }

    try {
      translations = this.transferState.get(languageKey, null) ?? await this.translationFetcher(locale);
    } catch { translations = {}; }

    return { ...fallbackTranslations, ...translations };
  }
}
