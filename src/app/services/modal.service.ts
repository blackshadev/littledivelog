import { Injectable } from "@angular/core";
import { BaseModalComponent } from "../components/modals/base/base-modal.component";

interface IModalOptions {
    extra?: any;
}

@Injectable({
    providedIn: "root",
})
export class ModalService {
    private modals: BaseModalComponent[] = [];

    public add(modal: BaseModalComponent) {
        // add modal to array of active modals
        this.modals.push(modal);
    }

    public remove(id: string) {
        // remove modal from array of active modals
        this.modals = this.modals.filter((x) => x.id !== id);
    }

    public open(
        id: string,
        options: IModalOptions,
        cb?: (b: boolean) => void,
    ): void;
    public open(id: string, cb: (b: boolean) => void): void;
    public open(
        id: string,
        optionsOrCb: IModalOptions | ((b: boolean) => void),
        cb?: (b: boolean) => void,
    ) {
        let options: IModalOptions = {};
        if (typeof optionsOrCb === "function") {
            cb = optionsOrCb;
        } else {
            options = optionsOrCb;
        }

        // open modal specified by id
        const modal = this.modals.filter((x) => x.id === id)[0];
        modal.onCloseHandle = cb;
        modal.open(options.extra);
    }

    public close(id: string) {
        // close modal specified by id
        const modal = this.modals.filter((x) => x.id === id)[0];
        modal.close();
    }
}
