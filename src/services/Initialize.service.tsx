import { authenticatedAction } from "../store/slices/Auth.slice";
import { userActions } from "../store/slices/User.slice";
import { store } from "../store/Store";
import { authenticate } from "./Auth.service";
import { initUserData } from "./User.service";
import { StartWSConnection } from "./Websocket.service";

const dispatch = store.dispatch;

export async function reInitializeApp() {
    await initializeApp(await authenticate());
}

export async function initializeApp(res: any) {
    if (res && !res.Error) {
        initData(res);
        await StartWSConnection();
    }
}

export async function updateApp() {
    initData(await authenticate());
}

export function initData(res: any) {
    if (res && !res.Error) {
        dispatch(authenticatedAction.setAuthenticated(true));
        dispatch(userActions.setInitialState(res));
        initUserData(res);
    }
}