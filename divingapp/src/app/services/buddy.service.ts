import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { AuthService, AuthenticatedService } from 'app/services/auth.service';
import { IBuddy } from 'app/shared/dive';
import { serviceUrl } from 'app/shared/config';
import { ResourceHttp } from 'app/shared/http';

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
    private __cache?: IBuddy[];
    constructor(protected http: ResourceHttp, protected auth: AuthService) {
        super(auth);
    }

    public clearCache() {
        this.__cache = undefined;
    }

    public async list(): Promise<IBuddy[]> {
        if (!this.__cache) {
            const req = await this.http
                .get(`${serviceUrl}/buddy/`, this.httpOptions)
                .toPromise();
            const buds = req.json() as IBuddy[];
            this.__cache = buds;
        }

        return this.__cache;
    }

    public async fullList(): Promise<IBuddyStat[]> {
        const resp = await this.http
            .get(`${serviceUrl}/buddy/full`, this.httpOptions)
            .toPromise();
        return resp.json() as IBuddyStat[];
    }

    public async update(data: IBuddy): Promise<IBuddy> {
        let req: Response;
        if (data.buddy_id === undefined) {
            req = await this.http
                .post(`${serviceUrl}/buddy/`, data, this.httpOptions)
                .toPromise();
        } else {
            req = await this.http
                .put(
                    `${serviceUrl}/buddy/${data.buddy_id}`,
                    data,
                    this.httpOptions,
                )
                .toPromise();
        }

        this.clearCache();
        return req.json() as IBuddy;
    }

    public async delete(id: number): Promise<boolean> {
        const req = await this.http
            .delete(`${serviceUrl}/buddy/${id}`, this.httpOptions)
            .toPromise();

        this.clearCache();
        return req.json();
    }
}
