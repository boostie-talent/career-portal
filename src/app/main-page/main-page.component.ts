import { Component } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, TriangleAlert, Search, MapPin } from 'lucide-angular';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { JobListComponent } from '../job-list/job-list.component';
import { SearchService } from '../services/search/search.service';
import { SettingsService } from '../services/settings/settings.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [NgIf, NgStyle, FormsModule, TranslateModule, LucideAngularModule,
            SidebarComponent, JobListComponent],
  templateUrl: './main-page.component.html',
})
export class MainPageComponent {
  public icons = { TriangleAlert, Search, MapPin };

  public whatInput: string = '';
  public whereInput: string = '';

  public filterCount: number = 1;
  public listFilter: any = {};
  public displaySidebar: boolean = false;
  public loading: boolean = true;
  public error: boolean = false;

  private sidebarFilter: any = {};
  private searchFilter: any = {};

  constructor(private searchService: SearchService) {}

  public search(): void {
    const next: any = {};

    if (this.whereInput.trim()) {
      const w = this.whereInput.trim();
      next['location'] =
        `address.city{?^^equals}{?^^delimiter}${w}*{?^^delimiter} OR address.state{?^^equals}{?^^delimiter}${w}*{?^^delimiter}`;
    }

    if (this.whatInput.trim()) {
      const fields = SettingsService.settings.service.keywordSearchFields;
      let searchString = '';
      fields.forEach((field: string, i: number) => {
        if (i > 0) searchString += ' OR ';
        searchString += `${field}{?^^equals}${this.whatInput.trim()}*`;
      });
      this.searchService.getCurrentJobIds({ keyword: searchString }, []).subscribe((res: any) => {
        const ids: string[] = res.data.map((r: any) => `id{?^^equals}${r.id}`);
        next['ids'] = ids.length > 0 ? ids : ['id{?^^equals}0'];
        this.searchFilter = next;
        this.mergeAndUpdate();
      });
    } else {
      this.searchFilter = next;
      this.mergeAndUpdate();
    }
  }

  public onSidebarFilter(filter: any): void {
    this.sidebarFilter = filter;
    this.mergeAndUpdate();
  }

  public toggleSidebar(value: boolean): void {
    this.displaySidebar = value;
  }

  public handleListLoad(loading: boolean): void {
    this.loading = loading;
  }

  public handleError(showError: boolean): void {
    this.error = showError;
  }

  private mergeAndUpdate(): void {
    this.listFilter = { ...this.searchFilter, ...this.sidebarFilter };
    this.filterCount++;
  }
}
