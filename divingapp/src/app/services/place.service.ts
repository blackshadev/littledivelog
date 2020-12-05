import { Injectable } from '@angular/core';
import { serviceUrl } from 'app/shared/config';
import { AuthService } from 'app/services/auth.service';
import { Response } from '@angular/http';
import { IPlace } from 'app/shared/dive';
import { HttpClient } from '@angular/common/http';

export interface ICountry {
    code: string;
    description: string;
}
export interface IPlaceStat {
    place_id: number;
    name: string;
    country_code: string;
    color: string;
    dive_count: number;
    last_dive: Date;
}

export interface IDbCountry {
    iso2: string;
    name: string;
}

@Injectable()
export class PlaceService {
    private __cache?: IPlace[];
    private __countries?: ICountry[];

    public static transformCountries(all: IDbCountry[]): ICountry[] {
        return all.map(c => {
            return { code: c.iso2, description: c.name };
        });
    }

    constructor(protected http: HttpClient) {}

    public async list(c?: string): Promise<IPlace[]> {
        if (!c && this.__cache) {
            return this.__cache;
        }

        const all = await this.http
            .get<IPlace[]>(`${serviceUrl}/places${c ? `/${c}` : ``}`)
            .toPromise();
        if (!c) {
            this.__cache = all;
        }
        return all;
    }

    public async countries(): Promise<ICountry[]> {
        if (this.__countries) {
            return this.__countries;
        }

        const all: IDbCountry[] = await this.http
            .get<IDbCountry[]>(`${serviceUrl}/country`)
            .toPromise();

        this.__countries = all.map(c => {
            return { code: c.iso2, description: c.name };
        });

        return this.__countries;
    }
}
