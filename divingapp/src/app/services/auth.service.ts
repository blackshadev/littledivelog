import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    ActivatedRoute,
} from '@angular/router';
import { Headers, Http, Response } from '@angular/http';
import { serviceUrl } from '../shared/config';
import 'rxjs/add/operator/toPromise';
import { ResourceHttp } from 'app/shared/http';

async function handleServerErrors(
    fn: () => Promise<void>,
    errFn?: (res: Response, bod: { error: string }) => void,
) {
    try {
        await fn();
    } catch (e) {
        if (e instanceof Response) {
            let o: any;
            try {
                o = e.json();
            } catch (_e) {
                /* NOOP, will be thrown by next statement */
            }
            if (o && o.error) {
                if (errFn) {
                    errFn(e, o);
                } else {
                    throw new Error(o.error);
                }
            }
        }
        throw new Error('Unable to parse server response');
    }
}

@Injectable()
export class AuthService {
    private _refreshToken: string;
    private _accessToken: string;
    get accessToken() {
        return this._accessToken;
    }
    get isLoggedIn() {
        return !!this._refreshToken;
    }

    constructor(
        private http: Http,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        // tslint:disable-next-line:max-line-length
        this._refreshToken = localStorage.getItem('jwt_refresh');
        this._accessToken = localStorage.getItem('jwt_access');

        window.addEventListener('unhandledRejection', e => {
            console.log('unhandledRejection', e);
            if (e instanceof Response && e.status === 401) {
                this.logout();
            }
        });
    }

    public setAccessHeaders(headers: Headers): void {
        headers.set('Authorization', 'Bearer ' + this.accessToken);
    }

    async logout(): Promise<void> {
        const headers = new Headers();
        this.setRefreshHeader(headers);

        await this.http
            .delete(`${serviceUrl}/auth/refresh-token`, {
                headers,
            })
            .toPromise();

        this.resetSessions();
    }

    resetSessions() {
        localStorage.removeItem('jwt_refresh');
        localStorage.removeItem('jwt_access');
        this._refreshToken = null;
        this._accessToken = null;
        window.location.reload();
    }

    async login(email: string, password: string): Promise<void> {
        await handleServerErrors(async () => {
            const a = await this.http
                .post(`${serviceUrl}/auth/refresh-token`, {
                    email,
                    password,
                    description: 'dive.littledev.nl User Login',
                })
                .toPromise();

            const o = a.json();
            if (o.error) {
                throw new Error(o.error);
            } else {
                this._refreshToken = o.jwt;
                localStorage.setItem('jwt_refresh', this._refreshToken);
            }
        });
    }

    async fetchAccessToken() {
        if (!this._refreshToken) {
            throw new Error('No refresh token');
        }
        await handleServerErrors(
            async () => {
                const headers = new Headers();
                this.setRefreshHeader(headers);

                const a = await this.http
                    .get(`${serviceUrl}/auth/access-token`, {
                        headers,
                    })
                    .toPromise();

                const o = a.json();
                if (o.error) {
                    throw new Error(o.error);
                } else {
                    this._accessToken = o.jwt;
                    localStorage.setItem('jwt_access', this._accessToken);
                }
            },
            (resp, errObj) => {
                if (resp.status === 401) {
                    this.logout();
                } else {
                    throw new Error(errObj.error);
                }
            },
        );
    }

    async register(oPar: { email: string; password: string; name?: string }) {
        await handleServerErrors(async () => {
            const a = await this.http
                .post(`${serviceUrl}/auth/register/`, oPar)
                .toPromise();

            const o = a.json();
            if (o.error) {
                throw new Error(o.error);
            }
        });
    }

    protected setRefreshHeader(headers: Headers) {
        headers.set('Authorization', 'Bearer ' + this._refreshToken);
    }
}

export class AuthenticatedService {
    constructor(protected http: ResourceHttp) {}
}
