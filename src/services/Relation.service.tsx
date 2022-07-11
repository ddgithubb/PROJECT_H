import { userActions } from "../store/slices/User.slice"
import { getState, store } from "../store/Store"
import { publicGet, userGet, userPost } from "./Http.service"

const dispatch = store.dispatch

function getRelationIDEndpoint(relationID: string) {
    return "/relation/" + relationID;
}

export function getUserByUsername(username: string) {
    return publicGet("/user?username=" + username);
}

export function request(relationID: string) {
    return userPost(getRelationIDEndpoint(relationID) + "/request").then((res) => {
        if (!res.Error) {
            dispatch(userActions.addRequested({ relationID, username: res.Username }));
        }
        return res
    })
}

export function unrequest(relationID: string) {
    return userPost(getRelationIDEndpoint(relationID) + "/remove").then((res) => {
        if (!res.Error) {
            dispatch(userActions.removeRequest(relationID));
        }
        return res
    })
}

export function accept(relationID: string) {
    return userPost(getRelationIDEndpoint(relationID) + "/accept").then((res) => {
        if (!res.Error) {
            dispatch(userActions.acceptRequest({ relationID, chainID: res.ChainID, created: res.Updated }));
        }
        return res
    })
}

export function unfriend(relationID: string) {
    return userPost(getRelationIDEndpoint(relationID) + "/remove").then((res) => {
        if (!res.Error) {
            dispatch(userActions.removeFriend(relationID));
        }
        return res
    })
}