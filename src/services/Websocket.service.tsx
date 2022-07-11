import { DeviceEventEmitter } from "react-native";
import { errorActions } from "../store/slices/Error.slice";
import { userActions } from "../store/slices/User.slice";
import { store, getState } from "../store/Store";
import { fatalError, networkError } from "./Errors.service";
import { updateApp, updateRelations } from "./Initialize.service";
import { WSHOST } from "../config/http";
import { ACKData, AuthResponseData, FriendAcceptedData, FriendRequestData, RefreshChainData, ReplyAuthTokenData, SendMessageData, WSMessage } from "../models/WS.model";
import { authActions } from "../store/slices/Auth.slice";
import { authorize, logout } from "./Auth.service";
import { getChainByChainID } from "./Chains.service";

var ws: WebSocket;
var heartbeatInterval = undefined;
var heartbeatTimeout = undefined;
var res: WSMessage;
var shouldAuthorize: boolean = false;

var prevWSID: string = "";

const dispatch = store.dispatch;

export function StartWSConnection() {

    if (ws) {
        ws.close();
    }

    return new Promise(function(resolve, reject) {

        
        ws = new WebSocket(WSHOST);

        ws.onopen = () => {
            console.log("OPEN");
        };
        ws.onmessage = (event) => {

            console.log("MESSAGE", event.data);
            res = JSON.parse(event.data)

            if (res.Op >= 1000 && res.Op < 2000) {
                switch (res.Op) {
                case 1000:
                    clearTimeout(heartbeatTimeout);
                    break;
                case 1001:

                    if (getState().auth.accessToken == "") {
                        logout();
                    }

                    let send1001func = () => {
                        let replyAuthTokenData: ReplyAuthTokenData = {
                            Token: getState().auth.accessToken,
                            PrevWSID: prevWSID
                        };
                        sendWSMessage(1001, replyAuthTokenData);
                    }
                    if (shouldAuthorize) {
                        let auth = authorize();
                        if (auth) {
                            auth.then(send1001func)
                        } else {
                            ws.close();
                        }
                        shouldAuthorize = false;
                    } else {
                        send1001func();
                    }
                    break;
                case 1002:
                    let authResponseData: AuthResponseData = res.Data
                    prevWSID = authResponseData.WSID
                    if (!authResponseData.Refresh) {
                        openWSGate()
                    }
                    resolve({
                        refresh: authResponseData.Refresh
                    })
                    break;
                }
            } else if (res.Op >= 3000 && res.Op < 4000) {
                switch (res.Op) {
                case 3000:
                    StartWSConnection();
                    break;
                case 3001:
                    shouldAuthorize = true
                    break;
                case 3002:
                    updateApp();
                    break;
                case 3101:
                    updateRelations();
                    break;
                case 3102:
                    let refreshChainData: RefreshChainData = res.Data;
                    getChainByChainID(refreshChainData.ChainID);
                    break;
                }
            } else {
                handleMessage(res);
            }

        }
        ws.onclose = (event) => {

            console.log("CLOSED", event);
            clearInterval(heartbeatInterval);
            clearTimeout(heartbeatTimeout);
            StartWSConnection();

        };
        ws.onerror = async (error: any) => {

            //ERROR THAT IS "cannot connect" is a 404 error

            console.log("ERROR", error);
            if (typeof error.message == "string") {
                if (error.message.includes("202")) {
                    //networkError("202");
                    //Reinitialize app not update (get access token, then intiialize, then websocket)
                    return;
                } else if (error.message.includes("500")) {
                    fatalError(error.message);
                    return;
                }
            }

        };
    });
}

export function closeWSGate() {
    if (!ws) return;
    sendWSMessage(1005);
    clearInterval(heartbeatInterval);
    clearTimeout(heartbeatTimeout);
}

export function openWSGate() {
    if (!ws) return;
    sendWSMessage(1006);
    dispatch(errorActions.clearErr(null));
    heartbeatInterval = setInterval(() => {
        sendWSMessage(1000);
        heartbeatTimeout = setTimeout(() => {
            console.log("Heartbeat TIMEOUT")
            StartWSConnection();
        }, 10000);
    }, 50000);
}

function sendWSMessage(op: number, data?: any) {
    console.log("WS SEND:", JSON.stringify({
        Op: op,
        Data: data
    }));
    ws.send(JSON.stringify({
        Op: op,
        Data: data
    } as WSMessage));
}

function sendACK(timestamp: number, signature: string) {
    sendWSMessage(1007, {
        Timestamp: timestamp,
        Signature: signature
    } as ACKData)
}

function handleMessage(msg: WSMessage) {
    let own: boolean = getState().user.userID == msg.OriginID;
    switch (msg.Op) {
    case 200:
        let friendRequestData: FriendRequestData = msg.Data;
        if (own) {
            dispatch(userActions.addRequested({
                relationID: msg.TargetID,
                username: friendRequestData.TargetUsername,
            }))
        } else {
            dispatch(userActions.addRequest({
                relationID: msg.OriginID,
                username: friendRequestData.OriginUsername,
            }))
        }
        break;
    case 201:
        let friendAcceptedData: FriendAcceptedData = msg.Data;
        if (own) {
            dispatch(userActions.acceptRequest({
                relationID: msg.TargetID,
                chainID: friendAcceptedData.ChainID,
                created: friendAcceptedData.Created
            }));
        } else {
            dispatch(userActions.acceptRequest({
                relationID: msg.OriginID,
                chainID: friendAcceptedData.ChainID,
                created: friendAcceptedData.Created
            }));
        }
        break;
    case 202:
        if (own) {
            dispatch(userActions.removeRelation(res.TargetID));
        } else {
            dispatch(userActions.removeRelation(res.OriginID)); 
        }
        break;
    case 300:
        let sendMessage: SendMessageData = msg.Data;
        dispatch(userActions.addMessageByChainID({
            chainID: sendMessage.ChainID,
            chain: {
                MessageID: sendMessage.MessageID,
                UserID: msg.OriginID,
                Created: sendMessage.Created,
                Expires: sendMessage.Expires,
                Type: sendMessage.Type,
                Duration: sendMessage.Duration,
                Display: sendMessage.Display,
                Seen: false,
            }
        }))
        break;
    }

    sendACK(msg.Timestamp, msg.Signature);
}

export function getWebsocketState() {
    if (ws) {
        return ws.readyState
    }
    return 3
}