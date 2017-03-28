import { Http } from '@angular/http';
import { Dive, IDive, IDiveRecordDC, TSample } from '../shared/dive';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import { BehaviorSubject, Observable } from 'rxjs/Rx';

interface ICountry {
    code: string;
    description: string;
};

@Injectable()
export class DiveStore  {
    private __dives: Dive[];
    private _dives: BehaviorSubject<Dive[]> = new BehaviorSubject([]);
    private __countries: ICountry[];

    constructor(
        private http: Http
    ) {
        this.ensureDives();
        this.getCountries();
    }

    get countries() {
        return Observable.fromPromise(this.getCountries());
    }
    get dives() { return this._dives.asObservable(); }

    async ensureDives() {
        if (this.__dives) {
            return ;
        }

        const local = localStorage.getItem('_dives');
        let dives: IDiveRecordDC[] | IDive[];

        if (!local) {

            const resp = await this.http.get(
                '/assets/sample-dives.json'
            ).toPromise();
            dives = resp.json().Dives;
            this.__dives = Dive.ParseAllDC(<IDiveRecordDC[]>dives);

        } else {
            dives = JSON.parse(local);
            this.__dives = Dive.ParseAll(<IDive[]>dives);
        }

        this._dives.next(this.__dives);
    }

    async getCountries(): Promise<ICountry[]> {
        if (this.__countries) {
            return this.__countries;
        }

        this.__countries = [
            { code: 'NL', description: 'Netherlands' },
            { code: 'DE', description: 'Germany' },
            { code: 'EG', description: 'Egypth' },
            { code: 'GR', description: 'Greece' },
        ];

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

    async saveDive(d: Dive) {
        this.__dives[d.id] = d;

        localStorage.setItem('_dives',
            JSON.stringify(this._dives.getValue().map((_d) => _d.toJSON()))
        );

    }

    async getDive(dive_id: number) {
        await this.ensureDives();

        return this.__dives[dive_id];
    }

    async getSamples(dive_id: number): Promise<TSample[]> {
        await this.ensureDives();

        return this.__dives[dive_id].samples;
    }

}
