import { createSlice } from "@reduxjs/toolkit";
import { Authenticated, AuthState } from "../../models/Auth.model";

const initialState: AuthState = {
    verifying: false,
    sessionID: "",
    refreshToken: {
        token: "",
        expireAt: 0,
    },
    accessToken: "",
    deviceToken: "",
    email: "",
};

const initialAuthenticatedState: Authenticated = {
    authenticated: false
}

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setAuth(state, { payload }) {
            state.refreshToken.token = payload.RefreshToken.Token
            state.refreshToken.expireAt = payload.RefreshToken.ExpireAt
            state.accessToken = payload.AccessToken
        },
        setSession(state, action) {
            state.sessionID = action.payload
        },
        clearAuth(state, action) {
            state.sessionID = ""
            state.refreshToken.token = ""
            state.refreshToken.expireAt = 0
            state.accessToken = ""
        },
        setVerifying(state, action) {
            state.verifying = action.payload
        },
        setDeviceToken(state, action) {
            state.deviceToken = action.payload
        },
        setEmail(state, action) {
            state.email = action.payload
        }
    }
});

const authenticatedSlice = createSlice({
    name: "authenticated",
    initialState: initialAuthenticatedState,
    reducers: {
        setAuthenticated(state, action) {
            state.authenticated = action.payload;
        },
    }
});

export const authReducers = authSlice.reducer;
export const authActions = authSlice.actions;
export const authenticatedReducer = authenticatedSlice.reducer;
export const authenticatedAction = authenticatedSlice.actions;