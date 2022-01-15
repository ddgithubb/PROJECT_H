import { Friend, Requests, User } from "../models/User.model";
import { userActions } from "../store/slices/User.slice";
import { store } from "../store/Store";
import { REQED_OBJECT, REQ_OBJECT } from "../config/text";

const dispatch = store.dispatch

export function initUserData(res: any) {
    setFriends(res.Relations.Friends);
    setRequests(res.Relations.Requests, res.Relations.Requested)
}

export function setFriends(friends: Friend[]) {
    if (friends) {
        dispatch(userActions.setFriends(friends))
    } else {
        dispatch(userActions.setFriends([]))
    }
}

export function setRequests(requests: Requests[], requested: Requests[]) {
    if (!requests) {
        requests = [];
    }
    if (!requested) {
        requested = [];
    }
    requests.unshift(REQ_OBJECT)
    requested.unshift(REQED_OBJECT)
    let totalRequests = requests.concat(requested);
    dispatch(userActions.setRequests(totalRequests))
}