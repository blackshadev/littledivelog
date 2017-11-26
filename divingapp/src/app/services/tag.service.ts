import { Injectable } from '@angular/core';
import { AuthenticatedService, AuthService } from 'app/services/auth.service';
import { Http, Response } from '@angular/http';
import { serviceUrl } from 'app/shared/config';

export interface ITagStat {
  tag_id: number;
  text: string;
  color: string;
  dive_count: Date;
  last_dive: Date;
}

export interface ITag {
  tag_id?: number;
  color: string;
  text: string;
}

@Injectable()
export class TagService extends AuthenticatedService {

    constructor(
      protected http: Http,
      protected auth: AuthService,
    ) {
      super(auth);
    }


  public async list(): Promise<ITag[]> {
    const req = await this.http.get(
        `${serviceUrl}/tag/`,
        this.httpOptions,
    ).toPromise();
    return req.json() as ITag[];
}

public async summarize(): Promise<ITagStat[]> {
  const resp = await this.http.get(
      `${serviceUrl}/stats/tags/`,
      this.httpOptions,
  ).toPromise();
  return resp.json() as ITagStat[];
}

public async update(data: ITag): Promise<ITag> {
  let req: Response;
  if (data.tag_id === undefined) {
    req = await this.http.post(
      `${serviceUrl}/tag/`,
      data,
      this.httpOptions,
    ).toPromise();
  } else {
    req = await this.http.put(
      `${serviceUrl}/tag/${data.tag_id}`,
      data,
      this.httpOptions,
    ).toPromise();
  }
  return req.json() as ITag;
}

}
