import { Component, OnInit, SecurityContext } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [NgIf],
  templateUrl: './privacy-policy.component.html',
})
export class PrivacyPolicyComponent implements OnInit {
  public loading: boolean = true;
  public data: any;

  constructor(private http: HttpClient, private domSanitize: DomSanitizer) {}

  public ngOnInit(): void {
    this.http.get('./static/privacy-policy.html', { responseType: 'text' }).subscribe((res) => {
      this.data = this.domSanitize.sanitize(SecurityContext.HTML, res);
      this.loading = false;
    });
  }
}
