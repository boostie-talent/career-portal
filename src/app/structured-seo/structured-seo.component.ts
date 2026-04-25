import { Component, Input, OnChanges, Renderer2, Inject } from '@angular/core';
import { JobBoardPost } from '@bullhorn/bullhorn-types';
import { SettingsService } from '../services/settings/settings.service';
import { DatePipe, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-structured-seo',
  standalone: true,
  template: '',
})
export class StructuredSeoComponent implements OnChanges {
  @Input() public jobData!: JobBoardPost;

  constructor(
    private renderer: Renderer2,
    private datePipe: DatePipe,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  public ngOnChanges(): void {
    const jsonObject = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: this.jobData.title,
      description: this.jobData.publicDescription,
      datePosted: this.datePipe.transform(this.jobData.dateLastPublished, 'long'),
      hiringOrganization: {
        '@type': 'Organization',
        name: SettingsService.settings.companyName,
        sameAs: SettingsService.settings.companyUrl,
        logo: SettingsService.settings.companyLogoPath,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: this.jobData.address?.city,
          addressRegion: this.jobData.address?.state,
          postalCode: (this.jobData.address as any)?.zip,
        },
      },
      baseSalary: {
        '@type': 'MonetaryAmount',
        value: {
          '@type': 'QuantitativeValue',
          value: this.jobData.salary,
          unitText: this.jobData.salaryUnit,
        },
      },
    };

    if (SettingsService.isServer) {
      const s = this.renderer.createElement('script');
      s.type = 'application/ld+json';
      s.text = JSON.stringify(jsonObject);
      this.renderer.appendChild(this.document.body, s);
    }
  }
}
