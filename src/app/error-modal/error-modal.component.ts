import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';

export interface ErrorModalData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [NgIf, TranslateModule],
  templateUrl: './error-modal.component.html',
})
export class ErrorModalComponent {
  constructor(
    public dialogRef: DialogRef<void>,
    @Inject(DIALOG_DATA) public data: ErrorModalData,
  ) {}

  public close(): void {
    this.dialogRef.close();
  }
}
