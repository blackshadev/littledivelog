import { AuthService, AuthenticatedService } from './auth.service';
import {Headers, Http,  Response} from '@angular/http';
import { Dive, IBuddy, IDbDive, IDiveRecordDC, IDiveTag, IPlace, ISample } from '../shared/dive';
import { serviceUrl } from '../shared/config';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';
import { ITagStat } from 'app/services/tag.service';

export interface ICountry {
    code: string;
    description: string;
}

export interface IComputer {
  computer_id: number;
  name: string;
  vendor: string;
  last_read: Date;
  dive_count: number;
}


export interface IPlaceStat {
    place_id: number;
    name: string;
    country_code: string;
    color: string;
    dive_count: Date;
    last_dive: Date;
}

@Injectable()
export class DiveStore extends AuthenticatedService {

    private __countries: ICountry[];

    constructor(
        protected http: Http,
        protected auth: AuthService,
    ) {
        super(auth);
        this.getCountries();
    }

    get countries() {
        return Observable.fromPromise(this.getCountries());
    }

    async getDives(): Promise<Dive[]> {
        let res: Response;
        try {
            res = await this.http.get(
                `${serviceUrl}/dive/`,
                this.httpOptions,
            ).toPromise();
        } catch (e) {
            this.handleError(e);
            return;
        }
        const dives: IDbDive[] = res.json() || [];
        return Dive.ParseAll(dives);
    }

    async getCountries(): Promise<ICountry[]> {
        if (this.__countries) {
            return this.__countries;
        }

        let res: Response;
        try {
            res = await this.http.get(
                `${serviceUrl}/country/`,
                this.httpOptions,
            ).toPromise();
        } catch (e) {
            this.handleError(e);
            return;
        }

        const all: { iso2: string, name: string }[] = res.json() || [];
        this.__countries = all.map(
            (c) => { return { code: c.iso2, description: c.name }; }
        );

        return this.__countries;
    }

    async getDiveSpots(c: string): Promise<IPlace[]> {
        console.log(c);
        const res = await this.http.get(
            `${serviceUrl}/place/${c}`,
            this.httpOptions,
        ).toPromise();
        const all: IPlace[] = res.json() || [];
        return all;
    }

    async saveDive(dive: IDbDive, dive_id?: number): Promise<any> {
        let req: Response;
        if (dive_id !== undefined) {
            req = await this.http.put(
                `${serviceUrl}/dive/${dive_id}/`,
                dive,
                this.httpOptions,
            ).toPromise();
        } else {
            req = await this.http.post(
                `${serviceUrl}/dive/`,
                dive,
                this.httpOptions,
            ).toPromise();
        }

        return req.json();
    }

    async getTags(): Promise<IDiveTag[]> {
        const req = await this.http.get(
            `${serviceUrl}/tag/`,
            this.httpOptions,
        ).toPromise();
        return req.json();
    }

    async getDive(dive_id: number): Promise<Dive|undefined> {

        const res = await this.http.get(
            `${serviceUrl}/dive/${dive_id}/`,
            this.httpOptions,
        ).toPromise();

        const r = res.json();
        return Dive.Parse(r);

    }

    async getSamples(dive_id?: number): Promise<ISample[]> {
        if (dive_id === undefined) {
            return [];
        }

        const resp = await this.http.get(
                `${serviceUrl}/dive/${dive_id}/samples/`,
                this.httpOptions,
            ).toPromise();
        return resp.json() as ISample[];

    }

    async getComputers(): Promise<IComputer[]> {
        const resp = await this.http.get(
                `${serviceUrl}/computer/`,
                this.httpOptions,
            ).toPromise();
        return resp.json() as IComputer[];
    }


    async getTagStats(): Promise<ITagStat[]> {
        const resp = await this.http.get(
            `${serviceUrl}/stats/tags/`,
            this.httpOptions,
        ).toPromise();
        return resp.json() as ITagStat[];
    }

    async getPlaceStats(): Promise<IPlaceStat[]> {
        const resp = await this.http.get(
            `${serviceUrl}/stats/places/`,
            this.httpOptions,
        ).toPromise();
        return resp.json() as IPlaceStat[];
    }

    private handleError(error: Response|any) {
        let errMsg: string;
        if (error instanceof Response) {
            if (error.status === 401) {
                this.auth.logout();
                return;
            }
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
