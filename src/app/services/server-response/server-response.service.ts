import { Inject, Injectable, Optional } from '@angular/core';
import { RESPONSE } from '../../tokens';
import { SettingsService } from '../settings/settings.service';

@Injectable({ providedIn: 'root' })
export class ServerResponseService {
  private response: any;

  constructor(@Optional() @Inject(RESPONSE) response: any) {
    this.response = response;
  }

  public setHeader(key: string, value: string): this {
    if (this.response) {
      this.response.header(key, value);
    }
    return this;
  }

  public setStatus(code: number, message?: string): this {
    if (this.response) {
      this.response.statusCode = code;
      if (message) this.response.statusMessage = message;
    }
    return this;
  }

  public setNotFound(message: string = 'not found'): this {
    if (SettingsService.isServer && this.response) {
      this.response.status(404);
      this.response.statusMessage = message;
    }
    return this;
  }

  public setCacheNone(): this {
    if (this.response) {
      this.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      this.setHeader('Pragma', 'no-cache');
    }
    return this;
  }
}
