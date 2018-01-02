import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthenticatedService, AuthService } from 'app/services/auth.service';
import { serviceUrl } from 'app/shared/config';

export interface IProfile {
    name: string;
    email: string;
    inserted: Date;
    dive_count: number;
    buddy_count: number;
    tag_count: number;
}

export interface IEquipment {
    tanks: Array<{
        volume: number,
        oxygen: number,
        pressure: {
            begin: number,
            end: number,
            type: 'bar'|'psi',
        }
    }>
}

@Injectable()
export class ProfileService extends AuthenticatedService {

    private _equipment?: IEquipment;

    constructor(
        protected http: Http,
        protected auth: AuthService,
    ) {
        super(auth);
    }

    public async get(): Promise<IProfile> {
        const res = await this.http.get(
            `${serviceUrl}/user/profile/`,
            this.httpOptions,
        ).toPromise();

        return res.json() as IProfile
    }

    public async save(o: { name: string }): Promise<void> {
        const res = await this.http.put(
            `${serviceUrl}/user/profile/`,
            {
                name: o.name,
            },
            this.httpOptions,
        ).toPromise();
    }

    public async changePassword(o: { old: string, new: string }): Promise<void> {

        const res = await this.http.put(
            `${serviceUrl}/user/profile/password`,
            {
                old: o.old,
                new: o.new,
            },
            this.httpOptions,
        ).toPromise();

    }

    public async equipment(): Promise<IEquipment> {
        if (this._equipment) {
            return this._equipment;
        }

        const res = await this.http.get(
            `${serviceUrl}/user/profile/equipment`,
            this.httpOptions,
        ).toPromise();

        return res.json();
    }

    public async changeEquipment(o: IEquipment): Promise<void> {
        const res = await this.http.put(
            `${serviceUrl}/user/profile/equipment`,
            o,
            this.httpOptions,
        ).toPromise();
    }

}
