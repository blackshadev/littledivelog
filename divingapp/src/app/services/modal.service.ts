import { Injectable } from '@angular/core';
import { ModalComponent } from '../components/controls/modal/modal.component';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    private modals: ModalComponent[] = [];

    public add(modal: ModalComponent) {
        // add modal to array of active modals
        this.modals.push(modal);
    }

    public remove(id: string) {
        // remove modal from array of active modals
        this.modals = this.modals.filter(x => x.id !== id);
    }

    public open(id: string, cb: (b: boolean) => void) {
        // open modal specified by id
        const modal = this.modals.filter(x => x.id === id)[0];
        modal.onCloseHandle = cb;
        modal.open();
    }

    public close(id: string) {
        // close modal specified by id
        const modal = this.modals.filter(x => x.id === id)[0];
        modal.close();
    }
}
