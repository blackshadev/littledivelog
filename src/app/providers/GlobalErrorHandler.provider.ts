import { ErrorHandler, Injectable } from "@angular/core";
import { ModalService } from "../services/modal.service";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private modal: ModalService) {}
    async handleError(err: Error) {
        let errorMessage = err.toString();
        try {
            if (err instanceof HttpErrorResponse) {
                if (err.error instanceof Blob) {
                    const txt = await err.error.text();
                    const _err = JSON.parse(txt);
                    errorMessage = _err.error;
                }
            }
        } catch {}

        this.modal.open(
            "error",
            {
                extra: new Error(errorMessage),
            },
            () => {},
        );
        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        throw err;
    }
}
