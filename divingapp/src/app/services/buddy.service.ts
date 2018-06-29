import { Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { IBuddy } from 'app/shared/dive';
import { serviceUrl } from 'app/shared/config';
import { HttpClient } from '@angular/common/http';

export interface IBuddyStat {
    buddy_id: number;
    text: string;
    color: string;
    dive_count: number;
    last_dive: Date;
    email: string;
    buddy_user_id: number;
}

@Injectable()
export class BuddyService {
    private __cache?: IBuddy[];
    constructor(protected http: HttpClient) {}

    public clearCache() {
        this.__cache = undefined;
    }

    public async list(): Promise<IBuddy[]> {
        if (!this.__cache) {
            this.__cache = await this.http
                .get<IBuddy[]>(`${serviceUrl}/buddy/`)
                .toPromise();
        }

        return this.__cache;
    }

    public async fullList(): Promise<IBuddyStat[]> {
        return await this.http
            .get<IBuddyStat[]>(`${serviceUrl}/buddy/full`)
            .toPromise();
    }

    public async update(data: IBuddy): Promise<IBuddy> {
        let req: IBuddy;
        if (data.buddy_id === undefined) {
            req = await this.http
                .post<IBuddy>(`${serviceUrl}/buddy/`, data)
                .toPromise();
        } else {
            req = await this.http
                .put<IBuddy>(`${serviceUrl}/buddy/${data.buddy_id}`, data)
                .toPromise();
        }

        this.clearCache();
        return req;
    }

    public async delete(id: number): Promise<boolean> {
        const res = await this.http
            .delete<boolean>(`${serviceUrl}/buddy/${id}`)
            .toPromise();

        this.clearCache();
        return res;
    }
}
