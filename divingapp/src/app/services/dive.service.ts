import { Http } from '@angular/http';
import { Dive } from '../shared/dive';
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class DiveService {

    constructor(private http: Http) {}

    async getDives() : Promise<Dive[]> {
        return this.http.get(
            "/assets/sample-dives.json"
        ).toPromise().then(
            (d) => Dive.ParseAll(d.json().Dives)
        );
    }
}
