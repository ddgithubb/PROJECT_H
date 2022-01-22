import * as FD from "form-data";
import { getState, GlobalState } from "../store/Store";

const DOMAIN: string = "10.0.0.18:8000"; //10.217.70.188:8000
const VERSION: string = "v1";
const HOST: string = "http://" + DOMAIN;
const WSHOST: string = "ws://" + DOMAIN + "/stream";
const URI: string = HOST + "/api/" + VERSION;
const AUTH_PATH: string =  URI + "/auth";
const PUBLIC_PATH: string = URI + "/public";
const USER_PATH: string = URI + "/user";
const NOTIF_TIME: number = 3000;

const HEADER_REFRESHED_NAME = "x-refreshed";
const HEADER_SESSION_ID_NAME = "x-session-id";
const HEADER_REFRESH_TOKEN_NAME = "x-refresh-token";
const HEADER_REFRESH_TOKEN_EXPIRE_NAME = "x-refresh-token-expire";
const HEADER_ACCESS_TOKEN_NAME = "x-access-token";

var state: GlobalState;

function setAuthHeaders(options: any) {
    state = getState();
    options.headers['Authorization'] = 'Bearer ' + state.auth.accessToken;
    options.headers[HEADER_SESSION_ID_NAME] = state.auth.sessionID;
    options.headers[HEADER_REFRESH_TOKEN_NAME] = state.auth.refreshToken.token;
    options.headers[HEADER_REFRESH_TOKEN_EXPIRE_NAME] = state.auth.refreshToken.expireAt.toString();
    return options;
}

function httpPostOptions(body?: any) {
    return {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}

function httpPostAuthOptions(body?: any) {
    return setAuthHeaders({
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}

function httpGetAuthOptions() {
    return setAuthHeaders({
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
}

function httpPutAuthOptions(body?: any) {
    return setAuthHeaders({
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}

function httpPostAuthFormOptions(body: FD) {
    return setAuthHeaders({
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
        },
        body: body as any as FormData
    });
}

function httpGetOptions() {
    return {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    }
}

export { 
    VERSION, 
    HOST, 
    WSHOST, 
    URI, 
    NOTIF_TIME, 
    AUTH_PATH, 
    PUBLIC_PATH, 
    USER_PATH, 
    HEADER_REFRESHED_NAME, 
    HEADER_SESSION_ID_NAME, 
    HEADER_REFRESH_TOKEN_NAME, 
    HEADER_REFRESH_TOKEN_EXPIRE_NAME, 
    HEADER_ACCESS_TOKEN_NAME, 
    httpPostOptions, 
    httpPostAuthOptions, 
    httpGetAuthOptions, 
    httpGetOptions, 
    httpPutAuthOptions, 
    httpPostAuthFormOptions
 }