import { authActions, authenticatedAction } from '../store/slices/Auth.slice';
import { errorActions } from '../store/slices/Error.slice';
import { store, getState } from '../store/Store';
import { reInitializeApp } from './Initialize.service';

const dispatch = store.dispatch;

export async function networkError(err: any) {
    //NETOWRK ERROR SHOW MESSAGE BUT DON"T RESTART (Network issues *footer red background)
    //Check connectivity elsewhere (analytics.service), use "Network Error vs Offline"
    //https://reactnativeforyou.com/how-to-check-internet-connectivity-in-react-native-android-and-ios/
    console.log("NETWORK ERR: " + err);
    var errors = getState().errors
    if (errors.clientErr) {
        //Offline dark/grey (in view)
    } else {
        dispatch(errorActions.setNetworkErr(true))
        await reInitializeApp();
        //"Network Error / trying to reconnect" red (in view)
    }
}

export function somethingWrong(err: any) {
    //DISPLAY MESSAGE
    console.log("SOMETHING WRONG: ", err)
}

export function fatalError(err: any) {
    //DISPLAY MESSAGE FREEZE AND TELL USER TO FORCE (COMPLETELY CLOSE (figure out a way maybe with redux state)) CLOSE APP
    console.log("FATAL ERR: " + err);
    dispatch(errorActions.setFatalErr(null))
    resetAuth();
}

export async function handleResponse(response: Response) {
    if (response.status == 404) {
        networkError(response.status);
    } else if (response.status >= 500) {
        //DISPLAY SERVER ERROR MESSAGE
        fatalError("500");
    } else if (response.status >= 400) {
        somethingWrong("unexpected 400 error");
    }
    let res = await response.json()
    dispatch(errorActions.clearErr(null))
    console.log("responded", res)
    return res
}

export function refreshTokenError(res: any) {
    if (res.Error) {
        if (res.Type == "Refresh Token") {
            resetAuth();
        }
        return res;
    }
    if (res.Refreshed == true) {
        dispatch(authActions.setAuth(res.Tokens))
    }
    return res.Data
}

function resetAuth() {
    dispatch(authenticatedAction.setAuthenticated(false));
    dispatch(authActions.clearAuth(null))
}