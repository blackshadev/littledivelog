import { Directive, ElementRef, HostListener, Input } from "@angular/core";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const operators = ["<", ">", "<=", ">=", "="] as const;
type TSize = typeof sizes[number];
type TOperator = typeof operators[number];

const sizesInPixels = {
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
};

const hideWhenRegExp = new RegExp(
    `^(${operators.map((c) => `\\${c}`).join("|")})(${sizes.join("|")})$`,
    "i",
);

@Directive({
    selector: "[appHideWhen]",
})
export class HideWhenDirective {
    private _size: TSize = "sm";
    private _operator: TOperator = "<";
    private _expression: (w: number) => boolean;
    private _isEnabled = true;

    @Input("appHideWhen") set condition(condition: string) {
        const [_, operator, size] = hideWhenRegExp.exec(condition);

        this._size = size as TSize;
        this._operator = operator as TOperator;

        this.createExpression();
        this.apply();
    }

    @Input("appHideWhen-enabled") set enabled(b: boolean) {
        this._isEnabled = b;
        this.apply();
    }

    public get isActive(): boolean {
        return this._isEnabled && this._expression(window.innerWidth);
    }

    constructor(private el: ElementRef) {}

    @HostListener("window:resize", ["$event"])
    onResize(event) {
        this.apply();
    }

    private createExpression() {
        this._expression = new Function(
            "w",
            `return w ${this._operator} ${sizesInPixels[this._size]}`,
        ) as (w: number) => boolean;
    }

    private apply() {
        (<HTMLElement>this.el.nativeElement).style.display = this.isActive
            ? "none"
            : "";
    }
}
