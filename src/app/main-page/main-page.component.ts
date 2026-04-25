import { Component } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { JobListComponent } from '../job-list/job-list.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [NgIf, NgStyle, TranslateModule, LucideAngularModule, SidebarComponent, JobListComponent],
  templateUrl: './main-page.component.html',
})
export class MainPageComponent {
  public icons = { TriangleAlert };
  public filterCount: number = 1;
  public listFilter: any = {};
  public displaySidebar: boolean = false;
  public loading: boolean = true;
  public error: boolean = false;

  public onSidebarFilter(filter: any): void {
    this.listFilter = filter;
    this.filterCount++;
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
}
