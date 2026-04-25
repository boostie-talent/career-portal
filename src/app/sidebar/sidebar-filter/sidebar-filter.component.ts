import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search/search.service';
import { IAddressListResponse, ICategoryListResponse } from '../../../typings';

interface FilterOption {
  value: string | number;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-sidebar-filter',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './sidebar-filter.component.html',
})
export class SidebarFilterComponent implements OnChanges {
  @Output() public checkboxFilter = new EventEmitter<string[]>();
  @Input() public filter: any;
  @Input() public field!: string;
  @Input() public title!: string;

  public loading: boolean = true;
  public options: FilterOption[] = [];
  public expanded: boolean = true;
  public showAll: boolean = false;
  readonly MAX_VISIBLE = 6;
  private fieldName!: string;

  get visibleOptions(): FilterOption[] {
    return this.showAll ? this.options : this.options.slice(0, this.MAX_VISIBLE);
  }

  get hiddenCount(): number {
    return Math.max(0, this.options.length - this.MAX_VISIBLE);
  }

  public toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  constructor(private service: SearchService) {}

  public ngOnChanges(): void {
    this.fieldName = this.field === 'publishedCategory(id,name)' ? 'publishedCategory' : this.field;
    this.getFilterOptions();
  }

  public toggle(): void {
    this.expanded = !this.expanded;
  }

  public onCheckChange(): void {
    const selected = this.options.filter((o) => o.checked);
    const values = this.buildFilterValues(selected.map((o) => o.value));
    this.checkboxFilter.emit(values);
  }

  private getFilterOptions(): void {
    this.loading = true;
    this.service.getCurrentJobIds(this.filter, [this.fieldName]).subscribe((res: any) => {
      const ids: number[] = res.data.map((r: any) => r.id);
      this.service.getAvailableFilterOptions(ids, this.field).subscribe((res2: any) => {
        this.setOptions(res2);
      });
    });
  }

  private setOptions(res: any): void {
    const existing = new Set(this.options.filter((o) => o.checked).map((o) => String(o.value)));

    switch (this.field) {
      case 'address(city)':
        this.options = res.data
          .filter((r: IAddressListResponse) => r.address?.city)
          .map((r: IAddressListResponse) => ({
            value: r.address.city,
            label: `${r.address.city} (${r.idCount})`,
            checked: existing.has(r.address.city),
          }));
        break;
      case 'address(state)':
        this.options = res.data
          .filter((r: IAddressListResponse) => r.address?.state)
          .map((r: IAddressListResponse) => ({
            value: r.address.state,
            label: `${r.address.state} (${r.idCount})`,
            checked: existing.has(r.address.state),
          }));
        break;
      case 'publishedCategory(id,name)':
        this.options = res.data
          .filter((r: ICategoryListResponse) => r.publishedCategory)
          .map((r: ICategoryListResponse) => ({
            value: r.publishedCategory.id,
            label: `${r.publishedCategory.name} (${r.idCount})`,
            checked: existing.has(String(r.publishedCategory.id)),
          }));
        break;
    }
    this.loading = false;
  }

  private buildFilterValues(values: (string | number)[]): string[] {
    if (values.length === 0) return [];
    switch (this.field) {
      case 'address(city)':
        return values.map((v) => `address.city{?^^equals}{?^^delimiter}${v}{?^^delimiter}`);
      case 'address(state)':
        return values.map((v) => `address.state{?^^equals}{?^^delimiter}${v}{?^^delimiter}`);
      case 'publishedCategory(id,name)':
        return values.map((v) => `publishedCategory.id{?^^equals}${v}`);
      default:
        return [];
    }
  }
}
