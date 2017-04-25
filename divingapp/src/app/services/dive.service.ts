import { Http, Response } from '@angular/http';
import { Dive,  IDbDive,  IDiveRecordDC,  TSample} from '../shared/dive';
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
    private session = '464debe8-8620-4cbb-8eb0-3c2656521ac9';
    private serverURL = 'https://dive.littledev.nl/api'

    constructor(
        private http: Http
    ) {
        this.getCountries();
    }

    get countries() {
        return Observable.fromPromise(this.getCountries());
    }

    getDives(): Observable<Dive[]> {
        return this.http.get(
                `${this.serverURL}/${this.session}/dive/`
            ).map(
                (res: Response): Dive[] => {
                    const dives: IDbDive[] = res.json() || [];
                    return Dive.ParseAll(dives);
                }
            ).catch(this.handleError);
    }

    async ensureDives() {
        // if (this.__dives) {
        //     return ;
        // }

        // const local = localStorage.getItem('_dives');
        // let dives: IDiveRecordDC[] | IDive[];

        // if (!local) {

        //     const resp = await this.http.get(
        //         '/assets/sample-dives.json'
        //     ).toPromise();
        //     dives = resp.json().Dives;
        //     this.__dives = Dive.ParseAllDC(<IDiveRecordDC[]>dives);

        // } else {
        //     dives = JSON.parse(local);
        //     this.__dives = Dive.ParseAll(<IDive[]>dives);
        // }

        // this._dives.next(this.__dives);
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

    async getDiveSpots(c: string): Promise<string[]> {
        switch (c) {
            case 'NL': return ['De beldert', 'Heidemeer'];
            case 'EG': return ['Fanadir Dagt'];
            case 'DE': return [];
            case 'GR': return [];
        }
        return [];
    }

    async saveDive(dive: IDbDive, dive_id?: number): Promise<any> {

        return this.http.put(
            `${this.serverURL}/${this.session}/dive/${dive_id}/`,
            dive
        ).toPromise();
    }

    getDive(dive_id: number): Observable<Dive> {
        return this.http.get(
                `${this.serverURL}/${this.session}/dive/${dive_id}/`
            ).map(
                (res: Response) => {
                    const r = res.json();
                    return Dive.Parse(r);
                }
            ).catch(this.handleError);
    }

    async getSamples(dive_id: number): Promise<TSample[]> {
        return this.http.get(
                `${this.serverURL}/${this.session}/dive/${dive_id}/samples/`
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
