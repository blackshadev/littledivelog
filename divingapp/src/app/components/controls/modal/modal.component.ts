import {
    Component,
    OnInit,
    Input,
    ElementRef,
    OnDestroy,
    ViewChild,
    Output,
    EventEmitter,
    AfterViewInit,
} from '@angular/core';
import { ModalService } from '../../../services/modal.service';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit, OnDestroy {
    @Input() titleText = 'Are you sure?';
    @Input() confirmText = 'Yes';
    @Input() cancelText = 'No';
    @Input() id: string;
    @Output() onClose = new EventEmitter<boolean>();
    public onCloseHandle?: (b: boolean) => void;

    private element: HTMLElement;

    @ViewChild('confirmButton', { static: false })
    private confirmButton: ElementRef;
    @ViewChild('cancelButton', { static: false })
    private cancelButton: ElementRef;

    constructor(private modalService: ModalService, private el: ElementRef) {
        this.element = el.nativeElement;
    }

    ngOnInit(): void {
        // ensure id attribute exists
        if (!this.id) {
            console.error('modal must have an id');
            return;
        }

        // move element to bottom of page (just before </body>) so it can be displayed above everything else
        document.body.appendChild(this.element);

        // add self (this modal instance) to the modal service so it's accessible from controllers
        this.modalService.add(this);
    }

    // remove self from modal service when component is destroyed
    ngOnDestroy(): void {
        this.modalService.remove(this.id);
        this.element.remove();
    }

    public onClick(event: Event, isConfirm: boolean) {
        if (this.onCloseHandle) {
            this.onCloseHandle(isConfirm);
        }
        this.onClose.emit(isConfirm);
        this.close();
    }

    open(): void {
        $('.modal', this.element).modal('show');
    }

    close(): void {
        $('.modal', this.element).modal('hide');
        this.onCloseHandle = undefined;
    }
}
