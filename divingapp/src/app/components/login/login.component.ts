import { AuthService } from '../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    public email: string;
    public password: string;
    public error: string;
    public message: string;
    private returnUrl: string;

    constructor(
        private auth: AuthService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe((v) => {
            this.returnUrl = v['returnUrl'];
            switch (v['msg']) {
                case 'registered': this.message = 'Registration complete, please login to continue.';
                    break;

            }
        });
    }

    onSubmit() {
        this.auth.login(
            this.email,
            this.password
        ).then(
            () => {
                this.redirect();
            }
        ).catch(
            (e) => {
                this.error = e.message;
            }
        );
    }

    redirect() {
        this.router.navigate([this.returnUrl || '/']);
    }

}
