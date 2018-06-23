import { AuthService } from './auth.service';
import { Response } from '@angular/http';
import { Dive, IDbDive, ISample } from '../shared/dive';
import { serviceUrl } from '../shared/config';
import { Injectable } from '@angular/core';
import { TagService } from 'app/services/tag.service';
import { BuddyService } from 'app/services/buddy.service';
import { arrayContains } from 'app/shared/common';
import { HttpClient } from '@angular/common/http';

export type TFilterKeys =
    | 'buddies'
    | 'tags'
    | 'from'
    | 'till'
    | 'date'
    | 'place'
    | 'country';

export interface IComputer {
    computer_id: number;
    name: string;
    vendor: string;
    last_read: Date;
    dive_count: number;
}

@Injectable()
export class DiveService {
    constructor(
        protected http: HttpClient,
        protected buddyService: BuddyService,
        protected tagService: TagService,
    ) {}

    public async list(
        filter: { [k in TFilterKeys]?: string } = {},
    ): Promise<Dive[]> {
        const qs = Object.keys(filter)
            .map(
                k =>
                    `${encodeURIComponent(k)}=${encodeURIComponent(filter[k])}`,
            )
            .join('&');

        const dives = await this.http
            .get<IDbDive[]>(`${serviceUrl}/dive/?${qs}`)
            .toPromise();

        return Dive.ParseAll(dives);
    }

    public async save(dive: IDbDive, dive_id?: number): Promise<any> {
        if (arrayContains(dive.buddies, b => b.buddy_id === undefined)) {
            this.buddyService.clearCache();
        }

        if (arrayContains(dive.tags, t => t.tag_id === undefined)) {
            this.tagService.clearCache();
        }

        if (dive_id !== undefined) {
            return await this.http
                .put<IDbDive>(`${serviceUrl}/dive/${dive_id}/`, dive)
                .toPromise();
        } else {
            return await this.http
                .post<IDbDive>(`${serviceUrl}/dive/`, dive)
                .toPromise();
        }
    }

    public async get(dive_id: number): Promise<Dive | undefined> {
        const dive = await this.http
            .get<IDbDive>(`${serviceUrl}/dive/${dive_id}/`)
            .toPromise();

        return Dive.Parse(dive);
    }

    public async delete(id: number): Promise<boolean> {
        const res = await this.http
            .delete<boolean>(`${serviceUrl}/dive/${id}`)
            .toPromise();
        return res;
    }

    public async samples(dive_id?: number): Promise<ISample[]> {
        if (dive_id === undefined) {
            return [];
        }

        return await this.http
            .get<ISample[]>(`${serviceUrl}/dive/${dive_id}/samples/`)
            .toPromise();
    }

    public async listComputers(): Promise<IComputer[]> {
        return await this.http
            .get<IComputer[]>(`${serviceUrl}/computer/`)
            .toPromise();
    }
}
