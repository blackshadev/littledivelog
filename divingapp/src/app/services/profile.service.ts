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

@Injectable()
export class ProfileService extends AuthenticatedService {


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

}
