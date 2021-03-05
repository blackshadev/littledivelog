import { Directive, Input, HostBinding } from '@angular/core';
import { serviceUrl } from 'app/shared/config';

// source https://coryrylan.com/blog/managing-external-links-safely-in-angular
@Directive({
    selector: '[appExternalLink]',
})
export class ExternalLinkDirective {
    @HostBinding('attr.rel') relAttr = '';
    @HostBinding('attr.target') targetAttr = '';
    @HostBinding('attr.href') hrefAttr = '';
    @Input() href: string;
    @Input() useDiveAPI: '' | undefined;

    constructor() {}

    ngOnChanges() {
        this.hrefAttr = `${this.useDiveAPI !== undefined ? serviceUrl : ''}${
            this.href
        }`;
        this.relAttr = 'noopener';
        this.targetAttr = '_blank';
    }
}
