import {
    ViewChild,
    Component,
    OnInit,
    ElementRef,
    Output,
    EventEmitter,
    Input,
} from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
    @ViewChild('menuContainer', { static: true }) menuContainer: ElementRef;
    @Output() ontoggle = new EventEmitter<boolean>();
    @Input('state')
    set state(v: boolean) {
        this.toggle(v);
    }

    get isLoggedIn() {
        return this.auth.isLoggedIn;
    }

    constructor(private auth: AuthService) {}

    toggle(state?: boolean) {
        const hElm = <HTMLElement>this.menuContainer.nativeElement;
        const isCollapsed = hElm.classList.contains('collapsed');
        state = state === undefined ? !isCollapsed : state;
        if (state) {
            hElm.classList.add('collapsed');
        } else {
            hElm.classList.remove('collapsed');
        }
        this.ontoggle.emit(state);
    }

    logout() {
        this.auth.logout();
    }
}
