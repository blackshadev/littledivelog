import { Request } from "express";

export interface IAuthenticatedRequest extends Request {
    user: {
        user_id: number;
        refresh_token: string;
    };
}
