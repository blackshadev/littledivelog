import { divetime } from '../shared/formatters';
import { Pipe, PipeTransform } from '@angular/core';
import { leftpad } from 'app/shared/formatters';

@Pipe({
  name: 'divetime'
})
export class DivetimePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return divetime(value);
  }

}
