import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, ActivatedRoute } from '@angular/router';
import { Headers, Http, Response } from '@angular/http';
import { serviceUrl } from '../shared/config';
import * as FileSaver from 'file-saver';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AuthService {

    private jwt: string;
    get token() { return this.jwt; }
    get isLoggedIn() { return !!this.jwt; }

    constructor(
        private http: Http,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        // tslint:disable-next-line:max-line-length
        this.jwt = localStorage.getItem('jwt');

        window.addEventListener(
            'unhandledRejection',
            (e) => {
                console.log('unhandledRejection', e);
                if (e instanceof Response && e.status === 401) {
                    this.logout();
                }
            }
        )
    }

    logout() {
        localStorage.removeItem('jwt');
        this.jwt = null;
        window.location.reload();
    }

    async login(
        email: string,
        password: string,
    ): Promise<void> {

        try {
            const a = await this.http.post(
                `${serviceUrl}/auth/`,
                {
                    email,
                    password,
                },
            ).toPromise();

            const o = a.json();
            if (o.error) {
                throw new Error(o.error);
            } else {
                this.jwt = o.jwt;
                localStorage.setItem('jwt', this.jwt);
            }

        } catch (e) {

            if (e instanceof Response) {
                let o: any;
                try {
                    o = e.json();
                } catch (_e) { /* NOOP, will be thrown by next statement */ }
                if (o && o.error) {
                    throw new Error(o.error);
                }
            }
            throw new Error('Unable to parse server response');

        }

    }

    async register(oPar: {
        email: string,
        password: string,
        name?: string
    }) {

        try {
            const a = await this.http.post(
                `${serviceUrl}/auth/register/`,
                oPar,
            ).toPromise();

            const o = a.json();
            if (o.error) {
                throw new Error(o.error);
            }

        } catch (e) {

            if (e instanceof Response) {
                let o: any;
                try {
                    o = e.json();
                } catch (_e) { /* NOOP, will be thrown by next statement */ }
                if (o && o.error) {
                    throw new Error(o.error);
                }
            }
            throw new Error('Unable to parse server response');

        }
    }

}

export class AuthenticatedService {
    protected headers: Headers;
    protected get httpOptions() {
        return {
            headers: this.headers,
        };
    }

    constructor(
        protected auth: AuthService,
    ) {
        this.headers = new Headers();
        this.headers.append('Authorization', 'Bearer ' + this.auth.token);
    }

    protected downloadFile(res: Response) {
        const blob = new Blob([res.blob()], { type: 'application/zip'});
        FileSaver.saveAs(blob, 'dive-uploader.zip');
    }
}
