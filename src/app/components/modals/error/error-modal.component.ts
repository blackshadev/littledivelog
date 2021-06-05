import { BaseModalComponent } from "../base/base-modal.component";
import { Input, Component } from "@angular/core";

@Component({
    selector: "app-error-modal",
    templateUrl: "./error-modal.component.html",
    styles: [
        `
            .panel {
                padding: 50px;
            }
        `,
    ],
})
export class ErrorModalComponent extends BaseModalComponent {
    @Input() public error: Error;
    open(extra: Error): void {
        this.error = extra;
        super.open(extra);
    }
}
