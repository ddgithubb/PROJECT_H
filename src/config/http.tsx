import * as FD from "form-data";
import { getState, GlobalState } from "../store/Store";

const DOMAIN: string = "10.0.0.18:9000"; //10.217.70.188:9000
const VERSION: string = "v1";
const HOST: string = "http://" + DOMAIN;
const WSHOST: string = "ws://" + DOMAIN + "/stream";
const URI: string = HOST + "/api" + VERSION;
const AUTH_PATH: string =  URI + "/auth";
const PUBLIC_PATH: string = URI + "/public";
const SOCIAL_PATH: string = URI + "/social";
const RESOURCE_PATH: string = URI + "/resources";
const FORM_PATH: string = URI + "/forms";
const NOTIF_TIME: number = 3000;

var state: GlobalState;

function httpPostOptions(body: any) {
    return {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}

function httpPostAuthOptions() {
    state = getState()
    return {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + state.auth.accessToken, 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionID: state.auth.sessionID,
            refreshToken: state.auth.refreshToken
        })
    }
}

function httpPutAuthOptions() {
    state = getState()
    return {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + state.auth.accessToken, 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionID: state.auth.sessionID,
            refreshToken: state.auth.refreshToken
        })
    }
}

function httpGetOptions() {
    return {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    }
}

function httpPostAuthFormOptions(body: FD) {
    state = getState();
    body.append("sessionID", state.auth.sessionID);
    body.append("token", state.auth.refreshToken.token);
    body.append("expireAt", state.auth.refreshToken.expireAt);
    return {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + state.auth.accessToken, 
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        },
        body: body as any as FormData
    }
}

export { VERSION, HOST, WSHOST, URI, NOTIF_TIME, AUTH_PATH, PUBLIC_PATH, SOCIAL_PATH, RESOURCE_PATH, FORM_PATH, httpPostOptions, httpPostAuthOptions, httpGetOptions, httpPutAuthOptions, httpPostAuthFormOptions }