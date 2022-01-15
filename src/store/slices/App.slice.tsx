import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "../../models/app.model";

const initialState: AppState = {
    state: "unknown"
}

const appSlice = createSlice({
    name: "app",
    initialState: initialState,
    reducers: {
        setAppState(state, action) {
            state.state = action.payload
        }
    }
});

export const appReducers = appSlice.reducer;
export const appActions = appSlice.actions;