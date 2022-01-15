import { createSlice } from "@reduxjs/toolkit";
import { ErrorState } from "../../models/Error.model";

const initialState: ErrorState = {
    clientErr: false,
    networkErr: false,
    fatalErr: false,
}

const errorSlice = createSlice({
    name: "error",
    initialState: initialState,
    reducers: {
        setClientErr(state, action) {
            state.clientErr = action.payload
        },
        setNetworkErr(state, action) {
            state.networkErr = action.payload
        },
        clearErr(state, action) {
            state.networkErr = false
            state.clientErr = false
        },
        setFatalErr(state, action) {
            state.fatalErr = true
        }
    }
});

export const errorReducers = errorSlice.reducer;
export const errorActions = errorSlice.actions;