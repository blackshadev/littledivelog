import { AuthService, AuthenticatedService } from './auth.service';
import { Headers, Response } from '@angular/http';
import { Dive, IBuddy, IDbDive, IDiveRecordDC, IDiveTag, IPlace, ISample } from '../shared/dive';
import { serviceUrl } from '../shared/config';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';
import { ITagStat } from 'app/services/tag.service';
import { CommonHttp } from 'app/shared/http';

export type TFilterKeys = 'buddies' | 'tags' | 'from' | 'till' | 'places' | 'country';


export interface IComputer {
    computer_id: number;
    name: string;
    vendor: string;
    last_read: Date;
    dive_count: number;
}


@Injectable()
export class DiveService extends AuthenticatedService {

    constructor(
        protected http: CommonHttp,
        protected auth: AuthService,
    ) {
        super(auth);
    }

    public async list(filter: {[k in TFilterKeys]?: string } = {}): Promise<Dive[]> {
        let res: Response;
        const qs = Object.keys(filter).map(
            (k) => `${encodeURIComponent(k)}=${encodeURIComponent(filter[k])}`,
        ).join('&');

        res = await this.http.get(
            `${serviceUrl}/dive/?${qs}`,
            this.httpOptions,
        ).toPromise();

        const dives: IDbDive[] = res.json() || [];
        return Dive.ParseAll(dives);
    }

    public async save(dive: IDbDive, dive_id?: number): Promise<any> {
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

    public async get(dive_id: number): Promise<Dive | undefined> {

        const res = await this.http.get(
            `${serviceUrl}/dive/${dive_id}/`,
            this.httpOptions,
        ).toPromise();

        const r = res.json();
        return Dive.Parse(r);
    }

    public async delete(id: number): Promise<boolean> {
        const resp = await this.http.delete(
            `${serviceUrl}/dive/${id}`,
            this.httpOptions,
        ).toPromise();
        return resp.json()
    }

    public async samples(dive_id?: number): Promise<ISample[]> {
        if (dive_id === undefined) {
            return [];
        }

        const resp = await this.http.get(
            `${serviceUrl}/dive/${dive_id}/samples/`,
            this.httpOptions,
        ).toPromise();
        return resp.json() as ISample[];
    }

    public async listComputers(): Promise<IComputer[]> {
        const resp = await this.http.get(
            `${serviceUrl}/computer/`,
            this.httpOptions,
        ).toPromise();
        return resp.json() as IComputer[];
    }

}
