import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Headers, Http, Response } from '@angular/http';
import { serviceUrl } from '../shared/config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

async function handleErrors(
    fn: () => Promise<void>,
    errFn: (res: HttpErrorResponse) => void = res => {
        throw new Error(res.message);
    },
) {
    try {
        await fn();
    } catch (error) {
        if (error instanceof HttpErrorResponse) {
            if (error.error instanceof ErrorEvent) {
                // A client-side or network error occurred. Handle it accordingly.
                console.error('An error occurred:', error.error.message);
            } else {
                // The backend returned an unsuccessful response code.
                // The response body may contain clues as to what went wrong,
                console.error(
                    `Backend returned code ${error.status}, ` +
                        `body was: ${error.error}`,
                );
                return errFn(error);
            }
            // return an observable with a user-facing error message
        }
        throw new Error('Something bad happened; please try again later.');
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

    public get accessHeader() {
        return { Authorization: 'Bearer ' + this._accessToken };
    }

    protected get refreshHeader() {
        return { Authorization: 'Bearer ' + this._refreshToken };
    }

    constructor(private http: HttpClient) {
        // tslint:disable-next-line:max-line-length
        this._refreshToken = localStorage.getItem('jwt_refresh');
        this._accessToken = localStorage.getItem('jwt_access');

        window.addEventListener('unhandledRejection', (e: unknown) => {
            console.log('unhandledRejection', e);
            if (e instanceof Response && e.status === 401) {
                this.logout();
            }
        });
    }

    async logout(): Promise<void> {
        try {
            await this.http
                .delete(`${serviceUrl}/auth/refresh-token`, {
                    headers: this.refreshHeader,
                })
                .toPromise();
        } catch {}
        this.resetSessions();
    }

    public resetSessions() {
        localStorage.removeItem('jwt_refresh');
        localStorage.removeItem('jwt_access');
        this._refreshToken = null;
        this._accessToken = null;
        this.reloadWindow();
    }

    public async login(email: string, password: string): Promise<void> {
        await handleErrors(async () => {
            const a = await this.http
                .post<{ jwt: string }>(`${serviceUrl}/auth/refresh-token`, {
                    email,
                    password,
                    description: 'dive.littledev.nl User Login',
                })
                .toPromise();

            this._refreshToken = a.jwt;
            localStorage.setItem('jwt_refresh', this._refreshToken);
        });
    }

    public async fetchAccessToken() {
        if (!this._refreshToken) {
            throw new Error('No refresh token');
        }
        await handleErrors(
            async () => {
                const a = await this.http
                    .get<{ jwt: string }>(`${serviceUrl}/auth/access-token`, {
                        headers: this.refreshHeader,
                    })
                    .toPromise();

                this._accessToken = a.jwt;
                localStorage.setItem('jwt_access', this._accessToken);
            },
            resp => {
                if (resp.status === 401) {
                    this.logout();
                } else {
                    throw new Error(resp.error);
                }
            },
        );
    }

    async register(oPar: { email: string; password: string; name?: string }) {
        await handleErrors(async () => {
            const a = await this.http
                .post(`${serviceUrl}/auth/register/`, oPar)
                .toPromise();
        });
    }

    protected reloadWindow() {
        window.location.reload();
    }
}
