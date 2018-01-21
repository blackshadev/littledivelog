import { Injectable } from '@angular/core';
import { serviceUrl } from 'app/shared/config';
import { AuthenticatedService, AuthService } from 'app/services/auth.service';
import { Response } from '@angular/http';
import { IPlace } from 'app/shared/dive';
import { ResourceHttp } from 'app/shared/http';

export interface ICountry {
    code: string;
    description: string;
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
export class PlaceService extends AuthenticatedService {
    private __cache?: IPlace[];
    private __countries?: ICountry[];

    constructor(protected http: ResourceHttp, protected auth: AuthService) {
        super(auth);
    }

    public async list(c: string = ''): Promise<IPlace[]> {
        if (!c && this.__cache) {
            return this.__cache;
        }

        const res = await this.http
            .get(`${serviceUrl}/place/${c}/`, this.httpOptions)
            .toPromise();
        const all: IPlace[] = res.json() || [];
        if (!c) {
            this.__cache = all;
        }
        return all;
    }

    public async fullList(): Promise<IPlaceStat[]> {
        const resp = await this.http
            .get(`${serviceUrl}/place/full/`, this.httpOptions)
            .toPromise();
        return resp.json() as IPlaceStat[];
    }

    public async countries(): Promise<ICountry[]> {
        if (this.__countries) {
            return this.__countries;
        }

        let res: Response;
        try {
            res = await this.http
                .get(`${serviceUrl}/country/`, this.httpOptions)
                .toPromise();
        } catch (e) {
            console.error(e);
            return;
        }

        const all: { iso2: string; name: string }[] = res.json() || [];
        this.__countries = all.map(c => {
            return { code: c.iso2, description: c.name };
        });

        return this.__countries;
    }
}
