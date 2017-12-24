import * as moment from 'moment';
import { FormControl, Validators, AbstractControl } from '@angular/forms';

export module CustomValidators {
    export const DateTimeFormats = <string[]>Object.freeze(['DD-MM-YYYY HH:mm:ss', 'DD-MM-YYYY', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD']);
    export function datetime(v: FormControl) {
        return moment(v.value, DateTimeFormats, true).isValid() ? null : { invalid: true };
    }

    export function duration(v: FormControl) {
        return /^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(v.value) ? null : { invalid: true };
    }

    export function decimal(v: FormControl) {
        return /\d+(\.\d+)?/.test(v.value) ? null : { invalid: true };
    }

    export function integer(v: FormControl) {
        return /\d+/.test(v.value) ? null : { invalid: true };
    }

    export function color(v: FormControl) {
        return /^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(v.value) ? null : { invalid: true };
    }

    export function optionalEmail(v: FormControl) {
        if (!v.value) {
            return null;
        }

        return Validators.email(v);
    }

    export function sameValue(v: string[]) {
        return function(form: AbstractControl) {
            let val: any;
            let valid = true;
            for (const cName of v) {
                const ctrl = form.get(cName);

                if (val !== undefined && ctrl.value !== val) {
                    ctrl.setErrors({
                        same: true,
                    });
                    valid = false;
                }

                val = ctrl.value;
            }

            return valid ? null : { same: true };
        }
    }
}
