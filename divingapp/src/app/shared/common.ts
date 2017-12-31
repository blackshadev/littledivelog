import { FormGroup } from '@angular/forms';

export function randomInt(hi: number, lo: number = 0) {
    return Math.floor(Math.random() * (hi - lo) + lo);
}

export function debounce(func: Function, wait: number, immediate?: boolean): Function {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    }
}

/**
 * Marks all controls in a form group as touched
 * @param formGroup - The group to caress..hah
 */
export function markFormGroupTouched(formGroup: FormGroup) {
    formGroup.markAsTouched();

    if (formGroup.controls) {
        for (const k in formGroup.controls) {
            if (formGroup.controls.hasOwnProperty(k)) {
                const control = formGroup.controls[k];
                markFormGroupTouched(control as FormGroup);
            }
        }
    }
}
