import { Component, Output, EventEmitter, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, X } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../services/settings/settings.service';
import { Router } from '@angular/router';
import { IAdditionalLanguageOption } from '../typings/settings';
import { SidebarFilterComponent } from './sidebar-filter/sidebar-filter.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule, RouterModule, LucideAngularModule, SidebarFilterComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Output() public newFilter = new EventEmitter<any>();
  @Output() public toggleSidebar = new EventEmitter<boolean>();
  @Input() public display: boolean = false;

  public icons = { X };
  public filter: object = {};

  public showPrivacyPolicy: boolean = SettingsService.settings.privacyConsent?.sidebarLink ?? false;
  public languageDropdownEnabled: boolean =
    (SettingsService.settings.languageDropdownOptions?.enabled ?? false) && !SettingsService.isServer;
  public availableLocales: IAdditionalLanguageOption[] =
    SettingsService.settings.languageDropdownOptions?.choices || [];

  constructor(private router: Router) {}

  public updateFilter(field: string, value: string | string[]): void {
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
