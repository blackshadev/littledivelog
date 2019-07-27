import { Request } from "express";

export interface IGetUserAuthInfoRequest extends Request {
    user: {
        user_id: number;
        refresh_token: string;
    };
}
