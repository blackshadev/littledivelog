import { AuthService } from "./auth.service";
import { Dive, IDbDive, ISample } from "../shared/dive";
import { serviceUrl } from "../shared/config";
import { Injectable } from "@angular/core";
import { TagService } from "app/services/tag.service";
import { BuddyService } from "app/services/buddy.service";
import { arrayContains } from "app/shared/common";
import { HttpClient } from "@angular/common/http";
import { encodeAsQueryString } from "app/shared/queryStringEncoder";

export type TFilterKeys =
    | "buddies"
    | "tags"
    | "from"
    | "till"
    | "date"
    | "place"
    | "country";

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

    public async list(): Promise<Dive[]> {
        const dives = await this.http
            .get<IDbDive[]>(`${serviceUrl}/dives/`)
            .toPromise();

        return Dive.ParseAll(dives);
    }

    public async search(
        filter: { [k in TFilterKeys]?: string | any } = {},
    ): Promise<Dive[]> {
        const qs = encodeAsQueryString(filter);

        const dives = await this.http
            .get<IDbDive[]>(`${serviceUrl}/dives/_search?${qs}`)
            .toPromise();

        return Dive.ParseAll(dives);
    }

    public async merge(dives: { dive_id: number }[]): Promise<any> {
        const ids = dives.map((k) => "dives[]=" + k.dive_id).join("&");

        await this.http
            .post<IDbDive[]>(`${serviceUrl}/dives/merge?${ids}`, {})
            .toPromise();
    }

    public async save(dive: IDbDive, dive_id?: number): Promise<any> {
        if (arrayContains(dive.buddies, (b) => b.buddy_id === undefined)) {
            this.buddyService.clearCache();
        }

        if (arrayContains(dive.tags, (t) => t.tag_id === undefined)) {
            this.tagService.clearCache();
        }

        if (dive_id !== undefined) {
            return await this.http
                .put<IDbDive>(`${serviceUrl}/dives/${dive_id}`, dive)
                .toPromise();
        } else {
            return await this.http
                .post<IDbDive>(`${serviceUrl}/dives`, dive)
                .toPromise();
        }
    }

    public async get(dive_id: number): Promise<Dive | undefined> {
        const dive = await this.http
            .get<IDbDive>(`${serviceUrl}/dives/${dive_id}`)
            .toPromise();

        return Dive.Parse(dive);
    }

    public async delete(id: number): Promise<boolean> {
        const res = await this.http
            .delete<boolean>(`${serviceUrl}/dives/${id}`)
            .toPromise();
        return res;
    }

    public async samples(dive_id?: number): Promise<ISample[]> {
        if (dive_id === undefined) {
            return [];
        }

        return await this.http
            .get<ISample[]>(`${serviceUrl}/dives/${dive_id}/samples`)
            .toPromise();
    }

    public async listComputers(): Promise<IComputer[]> {
        return await this.http
            .get<IComputer[]>(`${serviceUrl}/computers`)
            .toPromise();
    }
}
