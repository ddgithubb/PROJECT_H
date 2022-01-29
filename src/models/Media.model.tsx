import { Message } from "./User.model";

export interface MediaState {
    mode: MediaModes;
    isPlaying: boolean;
    curPlayingMessage: Message | undefined;
}

export enum MediaModes {
    DEFAULT,
    AUDIO,
}