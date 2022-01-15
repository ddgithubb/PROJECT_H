import { Requests } from "../models/User.model"

export const REQ_OBJECT: Requests = {
    RelationID: "REQUESTS",
    Username: "SECTION",
    ChainID: "",
    Requested: false,
}

export const REQED_OBJECT: Requests = {
    RelationID: "REQUESTED",
    Username: "SECTION",
    ChainID: "",
    Requested: true,
}