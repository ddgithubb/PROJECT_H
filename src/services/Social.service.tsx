import { userActions } from "../store/slices/User.slice"
import { getState, store } from "../store/Store"
import { publicGet, userPost } from "./Http.service"
import { sendAccept, sendRequest, sendUnfriend, sendUnrequest } from "./Websocket-send.service"

const dispatch = store.dispatch

export function getUserByUsername(username: string) {
    return publicGet("/user?username=" + username)
}

export function request(reqID: string, username: string) {
    return userPost("/request?requestid=" + reqID + "&username=" + getState().user.username).then((res) => {
        if (!res.Error) {
            sendRequest(reqID, res.ChainID)
            dispatch(userActions.addRequested({ reqID, username, chainID: res.ChainID }))
        }
        return res
    })
}

export function unrequest(reqID: string) {
    return userPost("/remove-relation?requestid=" + reqID).then((res) => {
        if (!res.Error) {
            sendUnrequest(reqID)
            dispatch(userActions.removeRequest(reqID))
        }
        return res
    })
}

export function accept(reqID: string, chainID: string) {
    return userPost("/accept?requestid=" + reqID + "&chainid=" + chainID).then((res) => {
        if (!res.Error) {
            sendAccept(reqID)
            dispatch(userActions.acceptRequest(reqID))
        }
        return res
    })
}

export function unfriend(reqID: string) {
    return userPost("/remove-relation?requestid=" + reqID).then((res) => {
        if (!res.Error) {
            sendUnfriend(reqID)
            dispatch(userActions.removeFriend(reqID))
        }
        return res
    })
}