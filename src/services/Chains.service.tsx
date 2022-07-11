import FormData from "form-data";
import { getState, store } from "../store/Store";
import { userPostForm, userGet, userPost } from "./Http.service";
import { Buffer } from 'buffer'
import { userActions } from "../store/slices/User.slice";

const dispatch = store.dispatch

export function getChainIDEndpoint(key: number) {
    return "/chain/" + getState().user.relations.Friends[key].ChainID;
}

export function sendAudio(key: number, display: number[], file: string, duration: number, expireDays?: number): Promise<any> {
   
    let displayBytes = Buffer.from(display).toString("utf-8");
    let form = new FormData()
    let state = getState();

    if (!expireDays) {
        expireDays = 60
    }

    form.append("audio", {
        uri: file,
        type: "audio/mpeg",
        name: "sent_audio.m4a",
    });
    form.append("display", displayBytes);
    form.append("duration", duration.toString());
    form.append("expireDays", expireDays)

    return userPostForm(getChainIDEndpoint(key) + "/audio", form).then((res) => {
        if (!res.Error) {
            dispatch(userActions.addMessage({ index: key, chain: {
                MessageID: res.MessageID,
                UserID: state.user.userID,
                Created: res.LastSeen,
                Expires: expireDays,
                Type: 0,
                Duration: duration,
                Display: displayBytes,
                Seen: false,
            }}));
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

export function getChainByChainID(chainID: string): Promise<any> {
    for (const relation of getState().user.relations.Friends) {
        if (relation.ChainID == chainID) {
            return getChain(relation.Key)
        }
    }
}

export function getExtraChain(key: number, reqTime: number, asc: boolean = false, limit?: number): Promise<any> {
    return userGet(getChainIDEndpoint(key) + "/get-chain?requestTime=" + reqTime.toString() + "&asc=" + asc + "&desc=" + !asc + (limit ? "&limit=" + limit.toString() : ""))
}