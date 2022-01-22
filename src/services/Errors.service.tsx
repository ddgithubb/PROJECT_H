import { authActions, authenticatedAction, resetAuth } from '../store/slices/Auth.slice';
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

export function internalError(err: any) {
    console.log("SERVER INTERNAL ERROR", err)
}
 
export function fatalError(err: any) {
    //DISPLAY MESSAGE FREEZE AND TELL USER TO FORCE (COMPLETELY CLOSE (figure out a way maybe with redux state)) CLOSE APP
    console.log("FATAL ERR: " + err);
    dispatch(errorActions.setFatalErr(null))
    resetAuth();
}