import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment-timezone";

@Pipe({
    name: "localdatetime",
})
export class LocaldatetimePipe implements PipeTransform {
    private static tz: string;
    transform(value: string, format: string, targetTz?: string): string {
        LocaldatetimePipe.tz = LocaldatetimePipe.tz ?? moment.tz.guess();
        targetTz = targetTz ?? LocaldatetimePipe.tz;

        value = value.replace(" ", "T");
        return moment.utc(value).tz(targetTz).format(format);
    }
}
