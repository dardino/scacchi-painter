import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@sp/gui/src/environments/environment';
import { marked } from 'marked';
import { baseUrl } from "marked-base-url";

marked.use(baseUrl(`${environment.assetFolder}/`));

@Pipe({
  name: 'markdown',
})
export class MarkdownPipe implements PipeTransform {
  transform(value: any, args?: any[]): any {
    if (value && value.length > 0) {
      return marked(value);
    }
    return value;
  }
}
