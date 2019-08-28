import { ErrorHandler, Injectable } from '@angular/core';
import { ModalService } from '../services/modal.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private modal: ModalService) {}
    handleError(error: Error) {
        this.modal.open(
            'error',
            {
                extra: error,
            },
            () => {},
        );
        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        throw error;
    }
}
