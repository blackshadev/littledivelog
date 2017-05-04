import { Pipe, PipeTransform } from '@angular/core';
import { leftpad } from "app/shared/formatters";

@Pipe({
  name: 'divetime'
})
export class DivetimePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) {
      return '00:00:00';
    }
    const t = {
      hh: leftpad(2, Math.floor(value / 3600).toFixed(0), '0'),
      mm: leftpad(2, (Math.floor(value / 60) % 60).toFixed(0), '0'),
      ss: leftpad(2, (Math.floor(value % 60)).toFixed(0), '0'),
    }

    return `${t.hh}:${t.mm}:${t.ss}`;
  }

}
