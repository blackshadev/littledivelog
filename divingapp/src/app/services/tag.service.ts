import { Injectable } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { Response } from '@angular/http';
import { serviceUrl } from 'app/shared/config';
import { HttpClient } from '@angular/common/http';

export interface ITagStat {
    tag_id: number;
    text: string;
    color: string;
    dive_count: number;
    last_dive: Date;
}

export interface ITag {
    tag_id?: number;
    color: string;
    text: string;
}

@Injectable()
export class TagService {
    private __cache?: ITag[];

    constructor(protected http: HttpClient, protected auth: AuthService) {}

    public clearCache() {
        this.__cache = undefined;
    }

    public async list(): Promise<ITag[]> {
        if (!this.__cache) {
            this.__cache = await this.http
                .get<ITag[]>(`${serviceUrl}/tag/`)
                .toPromise();
        }
        return this.__cache;
    }

    public async fullList(): Promise<ITagStat[]> {
        return await this.http
            .get<ITagStat[]>(`${serviceUrl}/tag/full`)
            .toPromise();
    }

    public async update(data: ITag): Promise<ITag> {
        let tag: ITag;
        if (data.tag_id === undefined) {
            tag = await this.http
                .post<ITag>(`${serviceUrl}/tag/`, data)
                .toPromise();
        } else {
            tag = await this.http
                .put<ITag>(`${serviceUrl}/tag/${data.tag_id}`, data)
                .toPromise();
        }

        this.clearCache();
        return tag;
    }

    public async delete(id: number): Promise<boolean> {
        const st = await this.http
            .delete<boolean>(`${serviceUrl}/tag/${id}`)
            .toPromise();

        this.clearCache();
        return st;
    }
}
