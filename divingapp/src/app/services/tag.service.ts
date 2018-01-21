import { Injectable } from '@angular/core';
import { AuthenticatedService, AuthService } from 'app/services/auth.service';
import { Response } from '@angular/http';
import { serviceUrl } from 'app/shared/config';
import { ResourceHttp } from 'app/shared/http';

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
export class TagService extends AuthenticatedService {
    private __cache?: ITag[];

    constructor(protected http: ResourceHttp, protected auth: AuthService) {
        super(auth);
    }

    public clearCache() {
        this.__cache = undefined;
    }

    public async list(): Promise<ITag[]> {
        if (!this.__cache) {
            const req = await this.http
                .get(`${serviceUrl}/tag/`, this.httpOptions)
                .toPromise();
            this.__cache = req.json() as ITag[];
        }
        return this.__cache;
    }

    public async fullList(): Promise<ITagStat[]> {
        const resp = await this.http
            .get(`${serviceUrl}/tag/full`, this.httpOptions)
            .toPromise();
        return resp.json() as ITagStat[];
    }

    public async update(data: ITag): Promise<ITag> {
        let req: Response;
        if (data.tag_id === undefined) {
            req = await this.http
                .post(`${serviceUrl}/tag/`, data, this.httpOptions)
                .toPromise();
        } else {
            req = await this.http
                .put(`${serviceUrl}/tag/${data.tag_id}`, data, this.httpOptions)
                .toPromise();
        }

        this.clearCache();
        return req.json() as ITag;
    }

    public async delete(id: number): Promise<boolean> {
        const req = await this.http
            .delete(`${serviceUrl}/tag/${id}`, this.httpOptions)
            .toPromise();

        this.clearCache();
        return req.json();
    }
}
