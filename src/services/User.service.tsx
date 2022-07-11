import { Friend, Relations, Requests, User } from "../models/User.model";
import { userActions } from "../store/slices/User.slice";
import { store } from "../store/Store";
import { REQED_OBJECT, REQ_OBJECT } from "../config/text";

const dispatch = store.dispatch

export function setRelations(relations: Relations) {
    setFriends(relations.Friends);
    setRequests(relations.Requests, relations.Requested);
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