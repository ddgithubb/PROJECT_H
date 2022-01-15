import FormData from "form-data";
import { getState, store } from "../store/Store";
import { postForm, resourcePost } from "./Http.service";
import { Buffer } from 'buffer'
import { userActions } from "../store/slices/User.slice";
import { sendMessage } from "./Websocket-send.service";

const dispatch = store.dispatch

export function sendAudio(key: number, display: number[], file: string, duration: number): Promise<any> {
    let displayBytes = Buffer.from(display).toString("utf-8");
    let form = new FormData()
    let state = getState();
    form.append("audio", {
        uri: file,
        type: "audio/mpeg",
        name: "sent_audio.m4a",
    });
    form.append("display", displayBytes);
    return postForm("/send-audio?chainID=" + state.user.relations.Friends[key].ChainID + "&requestid=" + state.user.relations.Friends[key].RelationID + "&duration=" + duration.toString(), form).then((res) => {
        if (!res.Error) {
            dispatch(userActions.addMessage({ index: key, chain: {
                MessageID: res.MessageID,
                UserID: state.user.userID,
                Created: res.LastSeen,
                Duration: duration,
                Display: displayBytes,
                Seen: false,
                Action: 0,
            }, lastSeen: res.LastSeen }));
            sendMessage(state.user.relations.Friends[key].RelationID, res.MessageID, res.LastSeen, duration, displayBytes);
        }
        return res;
    })
}

export function getChain(key: number): Promise<any> {
    let state = getState();
    return resourcePost("/get-chain?chainID=" + state.user.relations.Friends[key].ChainID + "&requestTime=" + Math.max(state.user.relations.Friends[key].LastRecv, state.user.relations.Friends[key].LastSeen)).then((res) => {
        if (!res.Error) {
            dispatch(userActions.newChain({ index: key, chain: res }));
        }
    })
}

export function getExtraChain(key: number, reqTime: number, asc: boolean = false, limit?: number): Promise<any> {
    let state = getState();
    return resourcePost("/get-chain?chainID=" + state.user.relations.Friends[key].ChainID + "&requestTime=" + reqTime.toString() + "&asc=" + asc + "&desc=" + !asc + (limit ? "&limit=" + limit.toString() : ""))
}