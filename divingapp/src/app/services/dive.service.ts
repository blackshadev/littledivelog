import { Http } from '@angular/http';
import { Dive, IDive } from '../shared/dive';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class DiveService  {

    constructor(private http: Http) {}

    private dives: Dive[];

    async ensureDives() {
        if(this.dives) return;

        let local = localStorage.getItem("_dives");
        let dives : IDive[];

        if(!local) {

            let resp = await this.http.get(
                "/assets/sample-dives.json"
            ).toPromise();
            dives = resp.json().Dives;
            
        } else {
            dives = JSON.parse(local);
        }

        this.dives = Dive.ParseAll(dives);
    }

    async saveDive(d: Dive) {
        this.dives[d.id] = d;
        localStorage.setItem("_dives", JSON.stringify(this.dives.map((d) => d.toJSON())));
    }

    async getDives() : Promise<Dive[]> {
        await this.ensureDives();
        return this.dives;
    }
    
    async getDive(id: number) : Promise<Dive> {
        await this.ensureDives();
        return this.dives[id];
    }

}
