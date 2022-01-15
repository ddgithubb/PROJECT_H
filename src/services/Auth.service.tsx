import { AuthState } from "../models/Auth.model";
import { authActions, authenticatedAction } from "../store/slices/Auth.slice";
import { store, getState } from "../store/Store";
import { encryptPassword } from "./Encryption.service";
import { authPost, resourcePost } from "./Http.service";

const dispatch = store.dispatch;
var body: any;

export function register(username: string, email: string, password: string): Promise<any> {
    return authPost("/register", {
        username: username,
        email: email,
        encPasswordHash: encryptPassword(password)
    }).then((response) => {
        dispatch(authActions.setEmail(email))
        return response
    })
}

export async function login(email: string, password: string): Promise<any> {
    return authPost("/login", {
        email: email,
        encPasswordHash: encryptPassword(password),
        deviceToken: getState().auth.deviceToken,
    });
}

export function authenticate() {
    let auth: AuthState = getState().auth;
    if (auth.refreshToken.token != "" && auth.refreshToken.expireAt != 0 && auth.accessToken != "" && auth.sessionID != ""){
        console.log("authenticating")
        return resourcePost("/authenticate")
    } else {
        dispatch(authActions.clearAuth(null))
    }
}

export function verifyEmail(code: string): Promise<any> {
    return authPost("/verify-email", {
        email: getState().auth.email,
        code: code
    })
}

export function resendEmail(): Promise<any> {
    return authPost("/resend-verification", {
        email: getState().auth.email
    })
}

export function logOut() {
    dispatch(authenticatedAction.setAuthenticated(false));
    dispatch(authActions.clearAuth(null))
}