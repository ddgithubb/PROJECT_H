import { sendWS } from "./Websocket.service";
import { DeviceEventEmitter } from "react-native";

export function sendRequest(reqID: string, chainID: string) {
    sendWS(["request", reqID, chainID]);
}

export function sendUnrequest(reqID: string) {
    sendWS(["unrequest", reqID]);
}

export function sendAccept(reqID: string) {
    sendWS(["accept", reqID]);
}

export function sendUnfriend(reqID: string) {
    sendWS(["unfriend", reqID]);
}

export function sendMessage(reqID: string, messageID: string, created: number, duration: number, display: string) {
    sendWS(["send-message", reqID, messageID, created.toString(), duration.toString(), display]);
}

export function sendAction(reqID: string, chainID: string, messageID: string, actionID: number) {
    sendWS(["send-action", reqID, chainID, messageID, actionID.toString()])
}

export function sendGetAudio(chainID: string, messageID: string, level: number, seen: boolean, userID: string) {
    sendWS(["get-audio", chainID, messageID, level.toString(), (seen ? "1" : "0"), userID])
    return new Promise((res, rej) => {
        let tempTimeout = setTimeout(() => {
            DeviceEventEmitter.removeAllListeners()
            rej("no response")
        }, 10000)
        DeviceEventEmitter.addListener("BYTE_RESPONSE", (bytes) => {
            clearTimeout(tempTimeout);
            DeviceEventEmitter.removeCurrentListener()
            res(bytes)
        })
    })
}