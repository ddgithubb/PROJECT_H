import { AUTH_PATH, httpPostOptions, httpPostAuthOptions, RESOURCE_PATH, SOCIAL_PATH, PUBLIC_PATH, httpGetOptions, httpPostAuthFormOptions, FORM_PATH } from "../config/http";
import { handleResponse, networkError, refreshTokenError } from "./Errors.service";
import FormData from "form-data";

export function authPost(endpoint: string, body: any): Promise<any> {
    return fetch(AUTH_PATH + endpoint, httpPostOptions(body))
    .then(handleResponse)
    .catch(networkError)
}

export function resourcePost(endpoint: string): Promise<any> {
    return fetch(RESOURCE_PATH + endpoint, httpPostAuthOptions())
    .then(handleResponse)
    .then(refreshTokenError)
    .catch(networkError)
}

export function socialPost(endpoint: string): Promise<any> {
    return fetch(SOCIAL_PATH + endpoint, httpPostAuthOptions())
    .then(handleResponse)
    .then(refreshTokenError)
    .catch(networkError)
}

export function publicGet(endpoint: string): Promise<any> {
    return fetch(PUBLIC_PATH + endpoint, httpGetOptions())
    .then(handleResponse)
    .catch(networkError)
}

export function postForm(endpoint: string, body: FormData): Promise<any> {
    return fetch(FORM_PATH + endpoint, httpPostAuthFormOptions(body))
    .then(handleResponse)
    .then(refreshTokenError)
    .catch(networkError)
}