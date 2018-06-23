import { Injectable } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { serviceUrl } from 'app/shared/config';
import { HttpClient } from '@angular/common/http';

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
        volume: number;
        oxygen: number;
        pressure: {
            begin: number;
            end: number;
            type: 'bar' | 'psi';
        };
    }>;
}

@Injectable()
export class ProfileService {
    private _equipment?: IEquipment;

    constructor(protected http: HttpClient, protected auth: AuthService) {}

    public async get(): Promise<IProfile> {
        return await this.http
            .get<IProfile>(`${serviceUrl}/user/profile/`)
            .toPromise();
    }

    public async save(o: { name: string }): Promise<void> {
        await this.http
            .put<void>(`${serviceUrl}/user/profile/`, {
                name: o.name,
            })
            .toPromise();
    }

    public async changePassword(o: {
        old: string;
        new: string;
    }): Promise<void> {
        await this.http
            .put(`${serviceUrl}/user/profile/password`, {
                old: o.old,
                new: o.new,
            })
            .toPromise();
    }

    public async equipment(): Promise<IEquipment> {
        if (this._equipment) {
            return this._equipment;
        }

        return await this.http
            .get<IEquipment>(`${serviceUrl}/user/profile/equipment`)
            .toPromise();
    }

    public async changeEquipment(o: IEquipment): Promise<void> {
        await this.http
            .put(`${serviceUrl}/user/profile/equipment`, o)
            .toPromise();
    }

    public async getSessions(): Promise<any[]> {
        return await this.http
            .get<any[]>(`${serviceUrl}/auth/refresh-token`)
            .toPromise();
    }

    public async deleteSession(token: string): Promise<void> {
        await this.http
            .delete(`${serviceUrl}/auth/refresh-token/${token}`)
            .toPromise();
    }
}
