import {Headers, Http,  Response} from '@angular/http';
import { Dive, IBuddy, IDbDive, IDiveRecordDC, IDiveTag, IPlace, TSample } from '../shared/dive';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';

interface ICountry {
    code: string;
    description: string;
};

@Injectable()
export class DiveStore  {
    private __countries: ICountry[];
    // tslint:disable-next-line:max-line-length
    private jwt = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE0OTM5Nzg1NzEsImlzcyI6Imh0dHBzOi8vZGl2ZS5saXR0bGVkZXYubmwifQ.3oG5svxWnvOI-rLckmWIBfKVkCQx6Yx55dQ-AbFJUSfl78trFZliD0sWpxldck0lPl39G_CA4YJD7Fj7MWQwKg';
    private serverURL = 'https://dive.littledev.nl/api'
    private headers: Headers;
    private get httpOptions() {
        return {
            headers: this.headers,
        };
    }

    constructor(
        private http: Http
    ) {
        this.getCountries();
        this.headers.append('Authorization', 'Bearer ' + this.jwt);
    }

    get countries() {
        return Observable.fromPromise(this.getCountries());
    }

    getDives(): Observable<Dive[]> {
        return this.http.get(
                `${this.serverURL}/dive/`,
                this.httpOptions,
            ).map(
                (res: Response): Dive[] => {
                    const dives: IDbDive[] = res.json() || [];
                    return Dive.ParseAll(dives);
                }
            ).catch(this.handleError);
    }

    async getCountries(): Promise<ICountry[]> {
        if (this.__countries) {
            return this.__countries;
        }

        const res = await this.http.get(
            `${this.serverURL}/country/`
        ).toPromise();
        const all: { iso2: string, name: string }[] = res.json() || [];
        this.__countries = all.map(
            (c) => { return { code: c.iso2, description: c.name }; }
        );

        return this.__countries;
    }

    async getDiveSpots(c: string): Promise<IPlace[]> {
        const res = await this.http.get(
            `${this.serverURL}/place/${c}`,
            this.httpOptions,
        ).toPromise();
        const all: IPlace[] = res.json() || [];
        return all;
    }

    async saveDive(dive: IDbDive, dive_id?: number): Promise<any> {

        return this.http.put(
            `${this.serverURL}/dive/${dive_id}/`,
            this.httpOptions,
            dive
        ).toPromise();
    }

    async getBuddies(): Promise<IBuddy[]> {
        const req = await this.http.get(
            `${this.serverURL}/buddy/`,
            this.httpOptions,
        ).toPromise();
        return req.json() as IBuddy[];
    }

    async getTags(): Promise<IDiveTag[]> {
        const req = await this.http.get(
            `${this.serverURL}/tag/`,
            this.httpOptions,
        ).toPromise();
        return req.json();
    }

    async getDive(dive_id: number): Promise<Dive> {
        const res = await this.http.get(
            `${this.serverURL}/dive/${dive_id}/`,
            this.httpOptions,
        ).toPromise();
        const r = res.json();
        return Dive.Parse(r);
    }

    async getSamples(dive_id: number): Promise<TSample[]> {
        return this.http.get(
                `${this.serverURL}/dive/${dive_id}/samples/`,
                this.httpOptions,
            ).toPromise(
            ).then(
                (res: Response) => {
                    const b = res.json();
                    return b as TSample[];
                }
            );
    }

    private handleError(error: Response|any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
