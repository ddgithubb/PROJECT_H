import { AuthState } from "../models/Auth.model";
import { Relations } from "../models/User.model";
import { authActions, authenticatedAction } from "../store/slices/Auth.slice";
import { userActions } from "../store/slices/User.slice";
import { getState, store } from "../store/Store";
import { userGet } from "./Http.service";
import { setFriends, setRelations, setRequests } from "./User.service";
import { openWSGate, StartWSConnection } from "./Websocket.service";

const dispatch = store.dispatch;

export async function initializeApp() {
    let auth = getState().auth;
    if (auth.refreshToken.token != "" && auth.refreshToken.expireAt != 0 && auth.accessToken != "" && auth.sessionID != "") {
        let refresh = await StartWSConnection();
        if (refresh) {
            await initData();
        }
    }
}

export async function updateApp() {
    //Refactor
    await initData();
}

export async function updateRelations() {
    userGet("/relation").then((res) => {
        if (res && !res.Error) {
            setRelations(res);
        }
    })
}

export async function initData() {
    let res = await userGet("/initialize");
    if (res && !res.Error) {
        dispatch(authenticatedAction.setAuthenticated(true));
        dispatch(userActions.setInitialState(res));
        setRelations(res.Relations)
        openWSGate();
    }
}