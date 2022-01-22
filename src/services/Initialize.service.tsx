import { AuthState } from "../models/Auth.model";
import { authActions, authenticatedAction } from "../store/slices/Auth.slice";
import { userActions } from "../store/slices/User.slice";
import { getState, store } from "../store/Store";
import { userGet } from "./Http.service";
import { initUserData } from "./User.service";
import { StartWSConnection } from "./Websocket.service";

const dispatch = store.dispatch;

export async function reInitializeApp() {
    await initializeApp(await getInitialize());
}

export async function initializeApp(res: any) {
    if (res && !res.Error) {
        initData(res);
        await StartWSConnection();
    }
}

export async function updateApp() {
    initData(await getInitialize());
}

export function initData(res: any) {
    if (res && !res.Error) {
        dispatch(authenticatedAction.setAuthenticated(true));
        dispatch(userActions.setInitialState(res));
        initUserData(res);
    }
}

export function getInitialize() {
    let auth: AuthState = getState().auth;
    if (auth.refreshToken.token != "" && auth.refreshToken.expireAt != 0 && auth.accessToken != "" && auth.sessionID != ""){
        console.log("initializing")
        return userGet("/initialize")
    } else {
        dispatch(authActions.clearAuth(null))
    }
}