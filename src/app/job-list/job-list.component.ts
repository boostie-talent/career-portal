import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, SlidersHorizontal, SearchX } from 'lucide-angular';
import { SearchService } from '../services/search/search.service';
import { SettingsService } from '../services/settings/settings.service';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { InfoChipsComponent } from '../components/info-chips/info-chips.component';
import { StripHtmlPipe } from '../utils/stripHtml.pipe';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule, TranslateModule, LucideAngularModule,
            InfoChipsComponent, StripHtmlPipe],
  templateUrl: './job-list.component.html',
})
export class JobListComponent implements OnChanges {
  @Input() public filter: any;
  @Input() public filterCount: number = 0;
  @Input() public sidebarVisible: boolean = false;
  @Output() public displaySidebar = new EventEmitter<boolean>();
  @Output() public showLoading = new EventEmitter<boolean>();
  @Output() public showError = new EventEmitter<boolean>();

  public icons = { SlidersHorizontal, SearchX };
  public jobs: any[] = [];
  public _loading: boolean = true;
  public moreAvailable: boolean = true;
  public total: number | string = '...';
  public showCategory: boolean = SettingsService.settings.service.showCategory;
  private start: number = 0;

  constructor(
    private http: SearchService,
    private titleService: Title,
    private meta: Meta,
    private router: Router,
    private translate: TranslateService,
  ) {}

  public ngOnChanges(_changes: SimpleChanges): void {
    this.getData();
  }

  public getData(loadMore: boolean = false): void {
    this.start = loadMore ? this.start + 30 : 0;
    this.titleService.setTitle(`${SettingsService.settings.companyName} - Careers`);
    const description = this.translate.instant('PAGE_DESCRIPTION');
    this.meta.updateTag({ name: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'description', content: description });
    this.http.getjobs(this.filter, { start: this.start }).subscribe({
      next: (res: any) => this.onSuccess(res),
      error: () => this.onFailure(),
    });
  }

  public loadMore(): void {
    this.getData(true);
  }

  public openSidebar(): void {
    this.displaySidebar.emit(true);
  }

  public loadJob(jobId: number): void {
    this.router.navigate([`jobs/${jobId}`]);
    this.loading = true;
  }

  get loading(): boolean { return this._loading; }
  set loading(value: boolean) {
    this.showLoading.emit(value);
    this._loading = value;
  }

  private onSuccess(res: any): void {
    this.jobs = this.start > 0 ? [...this.jobs, ...res.data] : res.data;
    this.total = res.total;
    this.moreAvailable = res.count === 30;
    this.loading = false;
  }

  private onFailure(): void {
    this.loading = false;
    this.jobs = [];
    this.total = 0;
    this.moreAvailable = false;
    this.showError.emit(true);
  }
}
