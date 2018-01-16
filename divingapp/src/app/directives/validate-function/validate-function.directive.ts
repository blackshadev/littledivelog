import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidatorFn } from '@angular/forms';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[validateFunction]',
    providers: [{provide: NG_VALIDATORS, useExisting: ValidateFunctionDirective, multi: true}]
})
export class ValidateFunctionDirective implements Validator {

    @Input()
    public validateFunction: ValidatorFn;

    constructor() { }

    validate(c: AbstractControl): { [key: string]: any; } {
        return this.validateFunction ? this.validateFunction(c.value) : null;
    }

}
