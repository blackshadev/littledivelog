import * as moment from "moment";
import { FormControl } from "@angular/forms";

export module CustomValidators {
    export const DateTimeFormats = <string[]>Object.freeze(["DD-MM-YYYY HH:mm:ss", "DD-MM-YYYY", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD"]);
    export function datetime(v: FormControl) {
        return moment(v.value, DateTimeFormats, true).isValid() ? null : { invalid: true };
    }

    export function duration(v: FormControl) {
        return /\d{1,2}:\d{1,2}(:\d{1,2})?/.test(v.value) ? null : { invalid: true };
    }
}