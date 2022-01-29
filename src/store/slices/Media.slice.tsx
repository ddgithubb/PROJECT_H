import { createSlice } from "@reduxjs/toolkit";
import { MediaModes, MediaState } from "../../models/Media.model";

const initialState: MediaState = {
    mode: MediaModes.DEFAULT,
    isPlaying: false,
    curPlayingMessage: undefined,
};

const mediaSlice = createSlice({
    name: "media",
    initialState: initialState,
    reducers: {
        setMode(state, { payload }) {
            state.mode = payload;
        },
        setPlaying(state, { payload }) {
            state.isPlaying = true;
            state.curPlayingMessage = payload.message;
            state.mode = payload.mode;
        },
        resetPlaying(state, action) {
            state.isPlaying = false;
            state.curPlayingMessage = undefined;
            state.mode = MediaModes.DEFAULT;
        },
        togglePlay(state, { payload }) {
            state.isPlaying = !state.isPlaying;
        },
        resumePlaying(state, { payload }) {
            state.isPlaying = true;
        },
        pausePlaying(state, { payload }) {
            state.isPlaying = false;
        },
    }
});

export const mediaReducers = mediaSlice.reducer;
export const mediaActions = mediaSlice.actions;