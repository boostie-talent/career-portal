import { Pipe, PipeTransform } from '@angular/core';
import { decode } from 'he';

@Pipe({
  name: 'stripHtml',
  standalone: true,
})
export class StripHtmlPipe implements PipeTransform {
  public transform(value: any): any {
    if (!value) return '';
    return decode(String(value).replace(/<.*?>/g, ''));
  }
}
