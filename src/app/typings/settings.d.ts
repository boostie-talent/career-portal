export interface ISettings {
  acceptedResumeTypes: string[];
  companyName: string;
  companyLogoPath: string;
  companyUrl: string;
  careersUrl: string;
  defaultLocale: string;
  supportedLocales: string[];
  minUploadSize: number;
  maxRelatedJobs: number;
  maxUploadSize: number;
  darkTheme: boolean;
  service: IServiceSettings;
  additionalJobCriteria: IAdditionalJobCriteria;
  integrations: IIntegrationSettings;
  eeoc: IEeoc;
  privacyConsent: IPrivacyConsent;
  languageDropdownOptions: ILanguageDropdownOptions;
  boostie: IBoostieSettings;
}

interface IBoostieSettings {
  clientId: string | null;
}

interface ITelemetrySettings {
  disabled: boolean;
}

interface IServiceSettings {
  batchSize: number;
  corpToken: string;
  port: number | null;
  swimlane: number | string;
  fields: string[];
  jobInfoChips: [string | JobChipField] | any;
  showCategory: boolean;
  keywordSearchFields: string[];
}

interface IIntegrationSettings {
  googleAnalytics: IGoogleAnalyticsSettings;
  googleSiteVerification: IGoogleSearchSettings;
}

interface IGoogleAnalyticsSettings {
  trackingId: string;
}
interface IGoogleSearchSettings {
  verificationCode: string;
}

interface IEeoc {
  genderRaceEthnicity: boolean;
  veteran: boolean;
  disability: boolean;
}

interface IPrivacyConsent {
  consentCheckbox: boolean;
  sidebarLink: boolean;
  privacyPolicyUrl: string;
}

interface IAdditionalJobCriteria {
  values: string[];
  field: string;
  sort: string;
}
interface JobChipField {
  type: string;
  field: string;
}
interface ILanguageDropdownOptions {
  enabled: boolean;
  choices: IAdditionalLanguageOption[];
}
interface IAdditionalLanguageOption {
  name: string;
  localeCode: string;
}
