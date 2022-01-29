import FormData from "form-data";
import { getState, store } from "../store/Store";
import { userPostForm, userGet, userPost } from "./Http.service";
import { Buffer } from 'buffer'
import { userActions } from "../store/slices/User.slice";
import { sendMessage } from "./Websocket-send.service";

const dispatch = store.dispatch

export function getChainIDEndpoint(key: number) {
    return "/chain/" + getState().user.relations.Friends[key].ChainID;
}

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
    form.append("duration", duration.toString());
    return userPostForm(getChainIDEndpoint(key) + "/audio", form).then((res) => {
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
    return userGet(getChainIDEndpoint(key) + "/get-chain?requestTime=" + Math.max(state.user.relations.Friends[key].LastRecv, state.user.relations.Friends[key].LastSeen)).then((res) => {
        if (!res.Error) {
            dispatch(userActions.newChain({ index: key, chain: res }));
        }
    })
}

export function getExtraChain(key: number, reqTime: number, asc: boolean = false, limit?: number): Promise<any> {
    return userGet(getChainIDEndpoint(key) + "/get-chain?requestTime=" + reqTime.toString() + "&asc=" + asc + "&desc=" + !asc + (limit ? "&limit=" + limit.toString() : ""))
}