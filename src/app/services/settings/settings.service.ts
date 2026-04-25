import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { TransferState, makeStateKey, StateKey } from '@angular/core';
import { ISettings } from '../../typings/settings';
import { TranslateService } from '@ngx-translate/core';
import { REQUEST } from '../../tokens';
import { lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import { join } from 'path';

const APP_CONFIG_URL = './app.json';
const LANGUAGE_KEY = makeStateKey<string>('language');

@Injectable()
export class SettingsService {
  public static settings: ISettings;
  public static isServer: boolean;
  public static isIos: boolean;
  public static urlRoot: string;
  public static loaded: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: string,
    @Optional() @Inject(REQUEST) protected request: any,
    private transferState: TransferState,
    private translate: TranslateService,
  ) {
    SettingsService.isServer = isPlatformServer(platformId);
  }

  public async load(): Promise<void> {
    let data: ISettings;
    const configKey: StateKey<number> = makeStateKey<number>('app-config');

    if (SettingsService.isServer) {
      const assetsFolder = join(process.cwd(), 'dist', 'career-portal', 'browser');
      data = JSON.parse(fs.readFileSync(join(assetsFolder, 'app.json'), 'utf8'));
      this.transferState.set(configKey, data as any);
    } else {
      data = this.transferState.get(configKey, null) as any;
      if (!data) {
        data = await lastValueFrom(this.http.get<ISettings>(APP_CONFIG_URL));
      }
    }

    await this.setConfig(data);
    SettingsService.loaded = true;
  }

  public async setConfig(data: ISettings): Promise<void> {
    SettingsService.settings = data;

    const objectDefaults: Record<string, object> = {
      service: {},
      additionalJobCriteria: {},
      integrations: {},
      eeoc: {},
      privacyConsent: {},
    };

    for (const [key, fallback] of Object.entries(objectDefaults)) {
      if (!(SettingsService.settings as any)[key]) {
        (SettingsService.settings as any)[key] = fallback;
      }
    }

    if (!SettingsService.settings.boostie) {
      SettingsService.settings.boostie = { clientId: null };
    }

    const clientId = SettingsService.settings.boostie.clientId;
    if (clientId && !/^[A-Za-z0-9-]+$/.test(clientId)) {
      throw new Error('Invalid Boostie Client ID — must be alphanumeric with hyphens only');
    }

    if (!SettingsService.settings.service.fields?.length) {
      SettingsService.settings.service.fields = [
        'id', 'title', 'publishedCategory(id,name)',
        'address(city,state,countryName)', 'employmentType',
        'dateLastPublished', 'publicDescription', 'isOpen',
        'isPublic', 'isDeleted', 'publishedZip', 'salary', 'salaryUnit',
      ];
    }

    if (!SettingsService.settings.service.jobInfoChips) {
      SettingsService.settings.service.jobInfoChips = [
        'employmentType',
        { type: 'mediumDate', field: 'dateLastPublished' },
      ];
    }

    if (!SettingsService.settings.service.keywordSearchFields?.length) {
      SettingsService.settings.service.keywordSearchFields = ['publicDescription', 'title'];
    }

    const validTokenRegex = /[^A-Za-z0-9]/;
    if (!SettingsService.settings.service.corpToken || validTokenRegex.test(SettingsService.settings.service.corpToken)) {
      throw new Error('Invalid Corp Token');
    }

    if (!SettingsService.settings.service.swimlane) {
      throw new Error('Invalid Swimlane');
    }

    await lastValueFrom(this.translate.use(this.getPreferredLanguage()));

    if (!SettingsService.isServer) {
      SettingsService.isIos = !!navigator.userAgent && /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
  }

  private getPreferredLanguage(): string {
    const supportedLanguages: string[] = SettingsService.settings.supportedLocales || [];
    let language: string = SettingsService.settings.defaultLocale;

    if (SettingsService.isServer) {
      if (this.request && typeof this.request.acceptsLanguages === 'function') {
        language = (this.request.acceptsLanguages(supportedLanguages) as string) || language;
      }
      this.transferState.set(LANGUAGE_KEY, language);
    } else {
      language =
        localStorage.getItem('preferredLanguage') ||
        this.transferState.get(LANGUAGE_KEY, undefined as any) ||
        supportedLanguages.find((l) => navigator.language === l) ||
        language;
    }

    return language;
  }
}
