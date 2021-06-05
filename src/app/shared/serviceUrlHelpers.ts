import { HttpRequest } from "@angular/common/http";
import { serviceUrl } from "./config";

export interface IEndpoint {
    method: string;
    path: string;
}

export function getServiceEndpointPrefix(): string {
    return new URL(serviceUrl).pathname;
}

export function hasEndpoint(target: IEndpoint, array: IEndpoint[]): boolean {
    const prefix = getServiceEndpointPrefix();
    for (const endpoint of array) {
        if (
            target.path === prefix + endpoint.path &&
            target.method === endpoint.method
        ) {
            return true;
        }
    }

    return false;
}

export function endpointFromRequest(request: HttpRequest<any>): IEndpoint {
    const url = new URL(request.url);
    return {
        method: request.method,
        path: url.pathname,
    };
}
