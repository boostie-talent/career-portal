import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor, NgIf, DatePipe, CurrencyPipe, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { JobBoardPost } from '@bullhorn/bullhorn-types';
import { SettingsService } from '../../services/settings/settings.service';

@Component({
  selector: 'app-info-chips',
  standalone: true,
  imports: [NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, DatePipe, CurrencyPipe],
  templateUrl: './info-chips.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoChipsComponent {
  @Input() public job!: JobBoardPost;
  public jobInfoChips: any[] = SettingsService.settings.service.jobInfoChips;
}
