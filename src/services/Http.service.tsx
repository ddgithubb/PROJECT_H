import { AUTH_PATH, httpPostOptions, httpPostAuthOptions, PUBLIC_PATH, USER_PATH, httpGetOptions, httpPostAuthFormOptions, httpGetAuthOptions, HEADER_SESSION_ID_NAME, HEADER_REFRESH_TOKEN_NAME, HEADER_REFRESH_TOKEN_EXPIRE_NAME, HEADER_REFRESHED_NAME, HEADER_ACCESS_TOKEN_NAME } from "../config/http";
import { internalError, networkError, somethingWrong } from "./Errors.service";
import FormData from "form-data";
import { getState, store } from "../store/Store";
import { errorActions } from "../store/slices/Error.slice";
import { authActions, resetAuth } from "../store/slices/Auth.slice";

const dispatch = store.dispatch;

async function handleResponse(response: Response) {
    console.log("response start")
    if (response.status == 404) {
        networkError(response.status);
    } else if (response.status >= 500) {
        internalError(response.status);
    } else if (response.status >= 400) {
        somethingWrong("unexpected 400 error");
    } else {
        console.log("headers refreshed", response.headers.get(HEADER_REFRESHED_NAME));
        if (response.headers.get(HEADER_REFRESHED_NAME) == "true") {
            if (response.headers.get(HEADER_SESSION_ID_NAME) && getState().auth.sessionID != response.headers.get(HEADER_SESSION_ID_NAME)) dispatch(authActions.setSession(response.headers.get(HEADER_SESSION_ID_NAME)));
            dispatch(authActions.setAuth({
                refreshToken: response.headers.get(HEADER_REFRESH_TOKEN_NAME),
                expireAt: response.headers.get(HEADER_REFRESH_TOKEN_EXPIRE_NAME),
                accessToken: response.headers.get(HEADER_ACCESS_TOKEN_NAME),
            }))
        }
    }
    let res = await response.json();
    console.log("responded", res);
    dispatch(errorActions.clearErr(null));
    if (res.Error && res.Problem == "RefreshToken") {
        resetAuth();
    }
    return res;
}

function fetchHandler(endpoint: string, options?: any) {
    console.log("Requested endpoint:", endpoint);
    return fetch(endpoint, options).then(handleResponse).catch(networkError);
}

export function authPost(endpoint: string, body?: any): Promise<any> {
    return fetchHandler(AUTH_PATH + endpoint, httpPostOptions(body))
}

export function publicGet(endpoint: string): Promise<any> {
    return fetchHandler(PUBLIC_PATH + endpoint, httpGetOptions())
}

export function userPost(endpoint: string, body?: any): Promise<any> {
    return fetchHandler(USER_PATH + endpoint, httpPostAuthOptions(body))
}

export function userGet(endpoint: string): Promise<any> {
    return fetchHandler(USER_PATH + endpoint, httpGetAuthOptions())
}

export function userPostForm(endpoint: string, body: FormData): Promise<any> {
    return fetchHandler(USER_PATH + endpoint, httpPostAuthFormOptions(body))
}