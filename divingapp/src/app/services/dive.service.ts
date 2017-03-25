import { Http } from '@angular/http';
import { Dive, IDive, IDiveRecordDC, TSample } from '../shared/dive';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs/Rx';


@Injectable()
export class DiveStore  {
    private __dives: Dive[];
    private _dives: BehaviorSubject<Dive[]> = new BehaviorSubject([]);

    constructor(
        private http: Http
    ) {
        this.ensureDives();
    }


    get dives() { return this._dives.asObservable(); }

    async ensureDives() {
        if (this.__dives) {
            return;
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

    async saveDive(d: Dive) {
        this.__dives[d.id] = d;

        localStorage.setItem('_dives',
            JSON.stringify(this._dives.getValue().map((d) => d.toJSON()))
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
