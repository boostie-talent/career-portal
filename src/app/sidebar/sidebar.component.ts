import { Component, Output, EventEmitter, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, X, Search } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../services/settings/settings.service';
import { SearchService } from '../services/search/search.service';
import { Router } from '@angular/router';
import { IAdditionalLanguageOption } from '../typings/settings';
import { SidebarFilterComponent } from './sidebar-filter/sidebar-filter.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TranslateModule, RouterModule,
            LucideAngularModule, SidebarFilterComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Output() public newFilter = new EventEmitter<any>();
  @Output() public toggleSidebar = new EventEmitter<boolean>();
  @Input() public display: boolean = false;

  public icons = { X, Search };
  public keyword: string = '';
  public timeout: any;
  public loading: boolean = false;
  public filter: object = {};

  public showPrivacyPolicy: boolean = SettingsService.settings.privacyConsent?.sidebarLink ?? false;
  public languageDropdownEnabled: boolean =
    (SettingsService.settings.languageDropdownOptions?.enabled ?? false) && !SettingsService.isServer;
  public availableLocales: IAdditionalLanguageOption[] =
    SettingsService.settings.languageDropdownOptions?.choices || [];

  constructor(private searchService: SearchService, private router: Router) {}

  public searchOnDelay(): void {
    const keywordSearchFields = SettingsService.settings.service.keywordSearchFields;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      let searchString = '';
      if (this.keyword.trim()) {
        keywordSearchFields.forEach((field: string, index: number) => {
          if (index > 0) searchString += ' OR ';
          searchString += `${field}{?^^equals}${this.keyword.trim()}*`;
        });
      }
      delete (this.filter as any)['ids'];
      if (searchString) {
        (this.filter as any)['keyword'] = searchString;
      } else {
        delete (this.filter as any)['keyword'];
      }
      this.searchService.getCurrentJobIds(this.filter, []).subscribe((res: any) => {
        let resultIds: string[] = res.data.map((r: any) => `id{?^^equals}${r.id}`);
        if (resultIds.length === 0) resultIds.push('id{?^^equals}0');
        this.updateFilter('ids', resultIds);
      });
    }, 250);
  }

  public updateFilter(field: string, value: string | string[]): void {
    delete (this.filter as any)['keyword'];
    (this.filter as any)[field] = value;
    const copy: object = {};
    Object.assign(copy, this.filter);
    this.filter = copy;
    this.newFilter.emit(this.filter);
  }

  public hideSidebar(): void {
    this.toggleSidebar.emit(false);
  }

  public viewPrivacyPolicy(): void {
    const url = SettingsService.settings.privacyConsent?.privacyPolicyUrl;
    if (url === '/privacy') {
      this.router.navigate([url]);
    } else if (url) {
      window.open(url);
    }
  }

  public setPreferredLanguage(language: string): void {
    localStorage.setItem('preferredLanguage', language);
    location.reload();
  }
}
