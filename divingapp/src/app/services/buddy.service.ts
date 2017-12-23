import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AuthService, AuthenticatedService } from 'app/services/auth.service';
import { IBuddy } from 'app/shared/dive';
import { serviceUrl } from 'app/shared/config';

export interface IBuddyStat {
    buddy_id: number;
    text: string;
    color: string;
    dive_count: Date;
    last_dive: Date;
    email: string;
    buddy_user_id: number;
}

@Injectable()
export class BuddyService extends AuthenticatedService {

    constructor(
        protected http: Http,
        protected auth: AuthService,
    ) {
        super(auth);
    }

    public async list(): Promise<IBuddy[]> {
        const req = await this.http.get(
            `${serviceUrl}/buddy/`,
            this.httpOptions,
        ).toPromise();
        return req.json() as IBuddy[];
    }

    public async summarize(): Promise<IBuddyStat[]> {
        const resp = await this.http.get(
            `${serviceUrl}/stats/buddies/`,
            this.httpOptions,
        ).toPromise();
        return resp.json() as IBuddyStat[];
    }

    public async update(data: IBuddy): Promise<IBuddy> {
        let req: Response;
        if (data.buddy_id === undefined) {
            req = await this.http.post(
                `${serviceUrl}/buddy/`,
                data,
                this.httpOptions,
            ).toPromise();
        } else {
            req = await this.http.put(
                `${serviceUrl}/buddy/${data.buddy_id}`,
                data,
                this.httpOptions,
            ).toPromise();
        }
        return req.json() as IBuddy;
    }

    public async delete(id: number): Promise<boolean> {
        const req = await this.http.delete(
            `${serviceUrl}/buddy/${id}`,
            this.httpOptions,
        ).toPromise();
        return req.json();
    }

}
