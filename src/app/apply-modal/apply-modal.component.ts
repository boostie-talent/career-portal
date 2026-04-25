import { Component, OnInit, Inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, X, Check } from 'lucide-angular';
import { Router } from '@angular/router';
import { SettingsService } from '../services/settings/settings.service';
import { ApplyService } from '../services/apply/apply.service';
import { AnalyticsService } from '../services/analytics/analytics.service';

export interface ApplyModalData {
  job: any;
  source: string;
}

@Component({
  selector: 'app-apply-modal',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './apply-modal.component.html',
})
export class ApplyModalComponent implements OnInit {
  public icons = { X, Check };
  public form!: FormGroup;
  public selectedFile: File | null = null;
  public fileError: string = '';
  public applying: boolean = false;
  public hasError: boolean = false;

  public showCategory: boolean = SettingsService.settings.service.showCategory;
  public consentCheckbox: boolean = SettingsService.settings.privacyConsent?.consentCheckbox ?? false;
  public showEeoc: boolean = false;
  public eeoc = SettingsService.settings.eeoc ?? {};

  public genderOptions = [
    { value: 'M', labelKey: 'EEOC.GENDER_MALE' },
    { value: 'F', labelKey: 'EEOC.GENDER_FEMALE' },
    { value: 'D', labelKey: 'EEOC.GENDER_ND' },
  ];
  public ethnicityOptions = [
    { value: 'HL', labelKey: 'EEOC.RACE_ETHNICITY_HL' },
    { value: 'WH', labelKey: 'EEOC.RACE_ETHNICITY_WH' },
    { value: 'BL', labelKey: 'EEOC.RACE_ETHNICITY_BL' },
    { value: 'AS', labelKey: 'EEOC.RACE_ETHNICITY_AS' },
    { value: 'NP', labelKey: 'EEOC.RACE_ETHNICITY_NP' },
    { value: 'IA', labelKey: 'EEOC.RACE_ETHNICITY_IA' },
    { value: 'DN', labelKey: 'EEOC.RACE_ETHNICITY_DN' },
  ];
  public veteranOptions = [
    { value: 'P', labelKey: 'EEOC.VETERAN_P' },
    { value: 'V', labelKey: 'EEOC.VETERAN_V' },
    { value: 'N', labelKey: 'EEOC.VETERAN_N' },
    { value: 'D', labelKey: 'EEOC.VETERAN_D' },
  ];
  public disabilityOptions = [
    { value: 'Y', labelKey: 'EEOC.DISABILITY_Y' },
    { value: 'N', labelKey: 'EEOC.DISABILITY_N' },
    { value: 'D', labelKey: 'EEOC.DISABILITY_D' },
  ];

  private readonly APPLIED_JOBS_KEY = 'APPLIED_JOBS_KEY';

  constructor(
    public dialogRef: DialogRef<void>,
    @Inject(DIALOG_DATA) public data: ApplyModalData,
    private fb: FormBuilder,
    private applyService: ApplyService,
    private analytics: AnalyticsService,
    private router: Router,
    private translate: TranslateService,
  ) {}

  public ngOnInit(): void {
    this.showEeoc = !!(this.eeoc.genderRaceEthnicity || this.eeoc.veteran || this.eeoc.disability);
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      gender: [''],
      ethnicity: [[]],
      veteran: [''],
      disability: [''],
      consent: [false, this.consentCheckbox ? Validators.requiredTrue : []],
    });
  }

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      const accepted = SettingsService.settings.acceptedResumeTypes ?? [];
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (accepted.length && !accepted.includes(ext)) {
        this.fileError = `Accepted types: ${accepted.join(', ')}`;
        this.selectedFile = null;
      } else if (file.size > (SettingsService.settings.maxUploadSize ?? 5242880)) {
        this.fileError = 'File too large';
        this.selectedFile = null;
      } else {
        this.fileError = '';
        this.selectedFile = file;
      }
    }
  }

  public toggleEthnicity(value: string): void {
    const current: string[] = this.form.value.ethnicity ?? [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    this.form.patchValue({ ethnicity: updated });
  }

  public close(): void {
    this.analytics.trackEvent(`Close apply form without applying for job ${this.data.job.id}`);
    this.dialogRef.close();
  }

  public save(): void {
    if (!this.form.valid || !this.selectedFile) return;
    this.applying = true;
    this.analytics.trackEvent(`Apply to Job: ${this.data.job.id}`);

    const v = this.form.value;
    const format = this.selectedFile.name.split('.').pop() ?? '';
    const params: any = {
      firstName: encodeURIComponent(v.firstName),
      lastName: encodeURIComponent(v.lastName),
      email: encodeURIComponent(v.email),
      phone: encodeURIComponent(v.phone || ''),
      format,
    };
    if (v.gender) params.gender = encodeURIComponent(v.gender);
    if (v.ethnicity?.length) params.ethnicity = encodeURIComponent(v.ethnicity.join(','));
    if (v.veteran) params.veteran = encodeURIComponent(v.veteran);
    if (v.disability) params.disability = encodeURIComponent(v.disability);
    if (this.data.source) params.source = this.data.source;

    const formData = new FormData();
    formData.append('resume', this.selectedFile);

    this.applyService.apply(this.data.job.id, params, formData).subscribe({
      next: () => this.onSuccess(),
      error: () => { this.hasError = true; this.applying = false; },
    });
  }

  public viewPrivacyPolicy(): void {
    const url = SettingsService.settings.privacyConsent?.privacyPolicyUrl;
    if (url === '/privacy') { this.router.navigate([url]); } else if (url) { window.open(url); }
  }

  private onSuccess(): void {
    const stored = sessionStorage.getItem(this.APPLIED_JOBS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    list.push(this.data.job.id);
    sessionStorage.setItem(this.APPLIED_JOBS_KEY, JSON.stringify(list));
    this.applying = false;
    this.analytics.trackEvent(`Success applying to job ${this.data.job.id}`);
    this.dialogRef.close();
  }
}
