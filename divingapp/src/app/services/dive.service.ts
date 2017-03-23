import { Http } from '@angular/http';
import { Dive, IDiveRecordDC, IDive } from '../shared/dive';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from "rxjs/Rx";

@Injectable()
export class DiveStore  {

    constructor(
        private http: Http
    ) {
        this.ensureDives();
    }

    private __dives: Dive[];
    private _dives: BehaviorSubject<Dive[]> = new BehaviorSubject([]);


    get dives() { return this._dives.asObservable(); }

    async ensureDives() {
        if(this.__dives) return;

        let local = localStorage.getItem("_dives");
        let dives : IDiveRecordDC[] | IDive[];

        if(!local) {

            let resp = await this.http.get(
                "/assets/sample-dives.json"
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
        
        localStorage.setItem("_dives", 
            JSON.stringify(this._dives.getValue().map((d) => d.toJSON()))
        );
        
    }

    async getDive(id: number) {
        await this.ensureDives();
        
        return this.__dives[id];
    }

    // async getDives() : Promise<Dive[]> {
    //     await this.ensureDives();
    //     return this.dives;
    // }
    
    // async getDive(id: number) : Promise<Dive> {
    //     await this.ensureDives();
    //     return this.dives[id];
    // }

}
