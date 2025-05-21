import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@sp/gui/src/environments/environment';
import { marked, MarkedOptions } from 'marked';
import { baseUrl } from "marked-base-url";

marked.use(baseUrl(`${environment.assetFolder}/`));

@Pipe({
    name: 'markdown',
    standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string, options?: MarkedOptions): string | Promise<string> {
    if (value && value.length > 0) {
      return marked(value, options);
    }
    return value;
  }
}
