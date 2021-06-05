import { Component, OnInit, ViewEncapsulation, Input } from "@angular/core";

@Component({
    selector: "app-tag",
    templateUrl: "./tag.component.html",
    styleUrls: ["./tag.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class TagComponent implements OnInit {
    @Input() public fontSize: string;

    @Input() set color(v: string) {
        const isValid = /^\#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(v);
        this._color = isValid ? v : "#fff";
    }

    get color(): string {
        return this._color;
    }

    get fontColor(): string {
        let color = this.color;
        if (color[0] === "#") {
            color = color.substr(1);
        }
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? "black" : "white";
    }

    private _color = "#fff";

    constructor() {}

    ngOnInit() {}
}
