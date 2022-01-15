import { createSlice } from "@reduxjs/toolkit";
import { AudioState } from "../../models/Audio.model";

const initialState: AudioState = {
    isPlaying: false,
    curPlayingMessageID: "",
};

const audioSlice = createSlice({
    name: "audio",
    initialState: initialState,
    reducers: {
        setPlaying(state, { payload }) {
            state.isPlaying = true;
            state.curPlayingMessageID = payload;
        },
        setResume(state, { payload }) {
            state.isPlaying = true;
        },
        setPause(state, { payload }) {
            state.isPlaying = false;
        },
        resetPlaying(state, action) {
            state.isPlaying = false;
            state.curPlayingMessageID = "";
        }
    }
});

export const audioReducers = audioSlice.reducer;
export const audioActions = audioSlice.actions;