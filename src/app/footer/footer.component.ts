import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../services/settings/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  public companyName: string = SettingsService.settings.companyName;
  public companyUrl: string = SettingsService.settings.companyUrl;
  public showPrivacyPolicy: boolean = SettingsService.settings.privacyConsent?.sidebarLink ?? false;
  public currentYear: number = new Date().getFullYear();
}
