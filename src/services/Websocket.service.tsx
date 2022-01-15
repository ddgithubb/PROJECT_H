import { DeviceEventEmitter } from "react-native";
import { errorActions } from "../store/slices/Error.slice";
import { userActions } from "../store/slices/User.slice";
import { store, getState } from "../store/Store";
import { fatalError, networkError } from "./Errors.service";
import { updateApp } from "./Initialize.service";
import { WSHOST } from "../config/http";

var ws: WebSocket;
var version: number;
var inactive: number;
var msgPayload: string[];

const dispatch = store.dispatch;

export function StartWSConnection() {

    var state = getState()

    if (ws) {
        ws.close();
    }

    if (state.auth.accessToken == "") {
        return;
    }

    return new Promise(function(resolve, reject) {
        
        version = 0;
        inactive = 0;
        ws = new WebSocket(WSHOST + '?token=' + state.auth.accessToken + "&username=" + state.user.username);

        ws.onopen = () => {
            console.log("OPEN");
            dispatch(errorActions.clearErr(null))
            resolve(null);
        };
        ws.onmessage = (event) => {
            if (event.data.slice(0, 4) == "PING") {
                console.log(event.data);
                if (event.data.slice(4) != version.toString()) {
                    updateApp()
                }
                ws.send("PONG");
                state.app.state.match(/inactive|background/) ? inactive <= 5 ? inactive++ : ws.close(1000) : inactive = 0;
                return;
            }
            if (event.data.substring(0, 4) == "byte") {
                DeviceEventEmitter.emit("BYTE_RESPONSE", "data:audio/mpeg;base64," + event.data.slice(4))
            } else {
                console.log("MESSAGE", event);
                handleMessage(event.data);
            }
        }
        ws.onclose = (event) => {
            console.log("CLOSED", event);
        };
        ws.onerror = async (error: any) => {
            console.log("ERROR", error);
            if (typeof error.message == "string") {
                if (error.message.includes("202")) {
                    networkError("202")
                    return;
                } else if (error.message.includes("500")) {
                    fatalError(error.message)
                    return;
                }
            }
            networkError(error.message);
        };
    });
}

function handleMessage(msg: string) {
    version < 999 ? version++ : version = 0;
    msgPayload = msg.split("|");
    switch (msgPayload[0]) {
        case "request":
            dispatch(userActions.addRequest({
                reqID: msgPayload[1],
                username: msgPayload[2],
                chainID: msgPayload[3],
            }))
            break;
        case "unrequest":
            dispatch(userActions.removeRequest(msgPayload[1]))
            break;
        case "accept":
            dispatch(userActions.acceptRequest(msgPayload[1]))
            break;
        case "unfriend":
            dispatch(userActions.removeFriend(msgPayload[1]))
            break;
        case "send-message":
            dispatch(userActions.addMessageByUserID({ chain: {
                MessageID: msgPayload[2],
                UserID: msgPayload[1],
                Created: Number(msgPayload[3]),
                Duration: Number(msgPayload[4]),
                Display: msgPayload[5],
                Seen: false,
                Action: 0,
            }}));
            break;
        case "send-action":
            dispatch(userActions.setActionByID({
                UserID: msgPayload[1],
                MessageID: msgPayload[2],
                ActionID: Number(msgPayload[3]),
            }));
            break;
    }
}

export function getWebsocketState() {
    if (ws) {
        return ws.readyState
    }
    return 3
}

export function sendWS(block: string[]) {
    ws.send(block.join("|"))
}