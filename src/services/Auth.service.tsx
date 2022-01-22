import { authActions, authenticatedAction } from "../store/slices/Auth.slice";
import { store, getState } from "../store/Store";
import { encryptPassword } from "./Encryption.service";
import { authPost } from "./Http.service";

const dispatch = store.dispatch;

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