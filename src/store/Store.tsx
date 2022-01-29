import createSensitiveStorage from "redux-persist-sensitive-storage";
import { persistStore, persistCombineReducers } from "redux-persist";
import { Action, createStore, Reducer } from "redux";
import { authenticatedReducer, authReducers } from './slices/Auth.slice'
import autoMergeLevel1 from "redux-persist/es/stateReconciler/autoMergeLevel1";
import { PersistPartial } from "redux-persist/es/persistReducer";
import { Authenticated, AuthState } from "../models/Auth.model";
import { errorReducers } from "./slices/Error.slice";
import { ErrorState } from "../models/Error.model";
import { AppState } from "../models/App.model";
import { appReducers } from "./slices/App.slice";
import { userReducers } from "./slices/User.slice";
import { UserState } from "../models/User.model";
import { MediaState } from "../models/Media.model";
import { mediaReducers } from "./slices/Media.slice";

const storage = createSensitiveStorage({
    keychainService: "appKeychain",
    sharedPreferencesName: "appSharedPref"
});

export type GlobalState = {
    authenticated: Authenticated;
    auth: AuthState;
    errors: ErrorState;
    app: AppState;
    user: UserState;
    media: MediaState;
}

export function getState(): GlobalState {
    return store.getState();
}

const config = {
    key: "root",
    storage,
    whitelist: ['auth'],
    stateReconciler: autoMergeLevel1,
};
  
const reducer: Reducer<any & PersistPartial, Action<any>> = persistCombineReducers(config, {
    authenticated: authenticatedReducer,
    auth: authReducers,
    errors: errorReducers,
    app: appReducers,
    user: userReducers,
    media: mediaReducers,
});

const store = createStore(reducer);
const persistor = persistStore(store);

export { store, persistor };
