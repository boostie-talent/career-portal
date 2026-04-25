import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, ArrowLeft, Share2, Mail, Twitter, Facebook, Linkedin, Printer } from 'lucide-angular';
import { Dialog } from '@angular/cdk/dialog';
import { SearchService } from '../services/search/search.service';
import { SettingsService } from '../services/settings/settings.service';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { ShareService } from '../services/share/share.service';
import { ServerResponseService } from '../services/server-response/server-response.service';
import { Title, Meta } from '@angular/platform-browser';
import { InfoChipsComponent } from '../components/info-chips/info-chips.component';
import { StructuredSeoComponent } from '../structured-seo/structured-seo.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [NgIf, RouterModule, TranslateModule, LucideAngularModule,
            InfoChipsComponent, StructuredSeoComponent],
  templateUrl: './job-details.component.html',
  providers: [DatePipe],
})
export class JobDetailsComponent implements OnInit {
  public job: any;
  public id!: string;
  public source!: string;
  public loading: boolean = true;
  public showShareButtons: boolean = false;
  public alreadyApplied: boolean = false;
  public showCategory: boolean = SettingsService.settings.service.showCategory;

  public icons = { ArrowLeft, Share2, Mail, Twitter, Facebook, Linkedin, Printer };

  private readonly APPLIED_JOBS_KEY = 'APPLIED_JOBS_KEY';

  get boostieActive(): boolean {
    return !!(SettingsService.settings as any).boostie?.clientId;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analytics: AnalyticsService,
    private shareService: ShareService,
    private titleService: Title,
    private meta: Meta,
    private serverResponse: ServerResponseService,
    private translate: TranslateService,
    private dialog: Dialog,
  ) {}

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    this.source = this.route.snapshot.queryParams['source'];
    this.analytics.trackEvent(`Open Job: ${this.id}`);
    this.checkSessionStorage();
    this.setJob();
  }

  public checkSessionStorage(): void {
    if (!SettingsService.isServer) {
      const stored = sessionStorage.getItem(this.APPLIED_JOBS_KEY);
      if (stored) {
        this.alreadyApplied = JSON.parse(stored).includes(parseInt(this.id, 10));
      }
    }
  }

  public async apply(): Promise<void> {
    this.analytics.trackEvent(`Open Apply Form ${this.job.id}`);
    const { ApplyModalComponent } = await import('../apply-modal/apply-modal.component');
    this.dialog.open(ApplyModalComponent, {
      data: { job: this.job, source: this.source },
      panelClass: 'apply-modal-panel',
      backdropClass: 'cdk-overlay-backdrop',
    }).closed.subscribe(() => this.checkSessionStorage());
  }

  public async openErrorModal(title: string, message: string): Promise<void> {
    const { ErrorModalComponent } = await import('../error-modal/error-modal.component');
    this.dialog.open(ErrorModalComponent, {
      data: { title, message },
      panelClass: 'apply-modal-panel',
      backdropClass: 'cdk-overlay-backdrop',
    }).closed.subscribe(() => this.goToJobList());
  }

  public toggleShareButtons(): void { this.showShareButtons = !this.showShareButtons; }
  public shareFacebook(): void { this.shareService.facebook(this.job); this.analytics.trackEvent(`Shared Job: ${this.id} via Facebook`); }
  public shareTwitter(): void { this.shareService.twitter(this.job); this.analytics.trackEvent(`Shared Job: ${this.id} via Twitter`); }
  public shareLinkedin(): void { this.shareService.linkedin(this.job); this.analytics.trackEvent(`Shared Job: ${this.id} via LinkedIn`); }
  public emailLink(): void { window.open(this.shareService.emailLink(this.job)); this.analytics.trackEvent(`Shared Job: ${this.id} via Email`); }
  public print(): void { window.print(); }
  public goToJobList(): void { this.router.navigate(['/']); }

  private setJob(): void {
    const res = this.route.snapshot.data['message'];
    if (res?.data?.length > 0) {
      this.job = res.data[0];
      this.titleService.setTitle(this.job.title);
      this.meta.updateTag({ name: 'og:title', content: this.job.title });
      this.meta.updateTag({ name: 'og:image', content: SettingsService.settings.companyLogoPath });
      this.meta.updateTag({ name: 'og:url', content: `${SettingsService.urlRoot}${this.router.url}` });
      this.meta.updateTag({ name: 'og:description', content: this.job.publicDescription });
      this.meta.updateTag({ name: 'twitter:description', content: this.job.publicDescription });
      this.meta.updateTag({ name: 'description', content: this.job.publicDescription });
      this.loading = false;
    } else {
      this.serverResponse.setNotFound();
      this.openErrorModal(
        this.translate.instant('ERROR'),
        this.translate.instant('MISSING_JOB_ERROR'),
      );
    }
  }
}
