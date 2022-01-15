import { createSlice } from "@reduxjs/toolkit";
import { Chain, ChainContainer, UserState } from "../../models/User.model";
import { EXTRA_CHAIN_LENGTH, MAX_SAVED_CHAIN_LENGTH, MAX_VIRTUAL_CHAIN_LENGTH, DEFAULT_LEFT_PLACEHOLDER_PADDING, INITIAL_LEFT_PADDING, MESSAGE_MAX_WIDTH, MESSAGE_SPACER, DATE_INDICATOR_WIDTH, CHAIN_METERS_WIDTH  } from '../../config/constants';
import { MESSAGES_TO_LOAD, NO_LAST_SEEN_OFFSET } from "../../services/Chat-activator.service";
import { HALF_PIXEL_WIDTH, PIXEL_WIDTH } from "../../config/dimensions";
import { calcDaysApart } from "../../services/Time.service";

const initialState: UserState = {
    username: "",
    userID: "",
    statement: "",
    relations: {
        Friends: [],
        Requests: [],
    },
    chains: [],
    curChainsIndex: [],
    selectedUserKey: -1,
    currentUserKey: -1,
}

const userSlice = createSlice({
    name: "user",
    initialState: initialState,
    reducers: {
        setInitialState(state, { payload }) {
            state.username = payload.Username;
            state.userID = payload.UserID;
            state.statement = payload.Statement;
            state.curChainsIndex = [];
            state.selectedUserKey = -1;
        },
        setSelectedUserIndex(state, { payload }) {
            state.selectedUserKey = payload;
            if (state.selectedUserKey != -1 && state.selectedUserKey != state.currentUserKey) {
                state.currentUserKey = state.selectedUserKey;
            }
        },
        setFriends(state, { payload }) {
            state.relations.Friends = payload;
            //////////////////////////////////////////
            for (let i = 0; i < 100; i++) {
                state.relations.Friends.push({
                    Username: "TEST",
                    RelationID: i.toString(),
                    ChainID: "",
                    LastSeen: 0,
                    LastRecv: 0,
                    Key: i + 1,
                    newMessages: 0,
                });
            }
            //////////////////////////////////////////////////
        },
        setRequests(state, { payload }) {
            state.relations.Requests = payload
        },
        addRequest(state, { payload }) {
            state.relations.Requests.splice(1, 0, {
                RelationID: payload.reqID,
                Username: payload.username,
                ChainID: payload.chainID,
                Requested: false
            })
        },
        addRequested(state, { payload }) {
            state.relations.Requests.push({
                RelationID: payload.reqID,
                Username: payload.username,
                ChainID: payload.chainID,
                Requested: true
            })
        },
        acceptRequest(state, { payload }) {
            let user;
            for (const [index, req] of state.relations.Requests.entries()) {
                if (req.RelationID == payload) {
                    user = req;
                    state.relations.Requests.splice(index, 1);
                    break;
                }
            }
            if (user) {
                state.relations.Friends.push({
                    RelationID: user.RelationID,
                    Username: user.Username,
                    ChainID: user.ChainID,
                    LastSeen: Date.now(),
                    LastRecv: Date.now(),
                    Key: state.relations.Friends.length,
                    newMessages: 0,
                });
            }
        },
        removeRequest(state, { payload }) {
            for (const [index, req] of state.relations.Requests.entries()) {
                if (req.RelationID == payload) {
                    state.relations.Requests.splice(index, 1);
                    break;
                }
            }
        },
        removeFriend(state, { payload }) {
            for (const [index, req] of state.relations.Friends.entries()) {
                if (req.RelationID == payload) {
                    state.relations.Friends.splice(index, 1);
                    break;
                }
            }
        },
        newChain(state, { payload }) {
            if (!payload.chain) return;
            state.curChainsIndex.push(payload.index);
            let chain = state.chains[payload.index] = { 
                virtualizedChain: [], 
                newestChain: parseAscChain(payload.chain).chain, 
                spaceBetween: 0, 
                attached: true,
                leftPadding: INITIAL_LEFT_PADDING,
                isNewest: false,
                virtualIndex: 0,
                initOffset: -1,
            };
            //console.log(chain.newestChain);
            for (let i = 0; i < chain.newestChain.length; i++) {
                if (chain.newestChain[i].Created == state.relations.Friends[payload.index].LastSeen) {
                    chain.virtualIndex = i;
                    chain.initOffset = i == chain.newestChain.length - 1 ? chain.newestChain[i].offset + chain.newestChain[i].totalWidth : chain.newestChain[i].offset - HALF_PIXEL_WIDTH;
                    state.chains[payload.index].isNewest = i == chain.newestChain.length - 1;
                    state.relations.Friends[payload.index].newMessages = chain.newestChain.length - 1 - i;
                    break;
                }
            }
            if (chain.initOffset == -1) {
                chain.initOffset = chain.leftPadding + NO_LAST_SEEN_OFFSET;
                for (let i = 0; i < chain.newestChain.length; i++) { 
                    if (chain.newestChain[i].offset + chain.newestChain[i].totalWidth > chain.initOffset + HALF_PIXEL_WIDTH) {
                        chain.virtualIndex = i;
                        state.relations.Friends[payload.index].newMessages = MAX_SAVED_CHAIN_LENGTH;
                        break;
                    }
                }
            }
            if (chain.newestChain.length < MAX_SAVED_CHAIN_LENGTH) {
                chain.newestChain[0].first = true;
            }
        },
        addMessage(state, { payload }) {
            let chain = state.chains[payload.index];
            if (!chain) return;
            pushMessage(chain, payload);
            if (payload.chain.UserID == state.userID) {
                state.relations.Friends[payload.index].LastSeen = payload.lastSeen
                state.relations.Friends[payload.index].newMessages = 0;
            }
        },
        addMessageByUserID(state, { payload }) {
            for (const friend of state.relations.Friends) {
                if (friend.RelationID == payload.UserID) {
                    let chain = state.chains[friend.Key];
                    if (!chain) return;
                    pushMessage(chain, payload);
                    friend.LastRecv = payload.Created;
                    state.relations.Friends[payload.index].newMessages++;
                    break;
                }
            }
        },
        setSeen(state, { payload }) {
            if (!state.chains[payload.index]) return;
            let found = false
            for (const [ index, message ] of state.chains[payload.index].newestChain.entries()) {
                if (message.MessageID == payload.messageID) {
                    if (message.Seen != payload.seen) message.Seen = payload.seen;
                    if (state.relations.Friends[payload.index].LastSeen < message.Created) {
                        state.relations.Friends[payload.index].LastSeen = message.Created;
                        state.relations.Friends[payload.index].newMessages = state.chains[payload.index].newestChain.length - 1 - index;
                    }
                    found = true;
                    break;
                }
            }
            if (found) return;
            for (const message of state.chains[payload.index].virtualizedChain) {
                if (message.MessageID == payload.messageID) {
                    if (message.Seen != payload.seen) message.Seen = payload.seen;
                    break;
                }
            }
        },
        setAction(state, { payload }) {
            if (!state.chains[payload.index]) return;
            let found = false;
            for (const message of state.chains[payload.index].newestChain) {
                if (message.MessageID == payload.messageID) {
                    message.Action = payload.actionID;
                    found = true;
                    break;
                }
            }
            if (found) return;
            for (const message of state.chains[payload.index].virtualizedChain) {
                if (message.MessageID == payload.messageID) {
                    message.Action = payload.actionID;
                    break;
                }
            }
        },
        setActionByID(state, { payload }) {
            for (const friend of state.relations.Friends) {
                if (friend.RelationID == payload.UserID) {
                    let found = false;
                    for (const message of state.chains[friend.Key].newestChain) {
                        if (message.MessageID == payload.MessageID) {
                            message.Action = payload.ActionID;
                            found = true;
                            break;
                        }
                    }
                    if (found) return;
                    for (const message of state.chains[friend.Key].virtualizedChain) {
                        if (message.MessageID == payload.MessageID) {
                            message.Action = payload.ActionID;
                            break;
                        }
                    }
                    break;
                }
            }
        },
        addAscExtraChain(state, { payload }) {
            let chain = state.chains[payload.index];
            if (!chain || !payload.chain) return;

            let chainPayload = parseAscChain(
                                    payload.chain, 
                                    chain.virtualizedChain[chain.virtualizedChain.length - 1], 
                                    payload.chain.length < EXTRA_CHAIN_LENGTH ? chain.newestChain[0] : undefined
                                ).chain;

            let lastMessage = chain.virtualizedChain[chain.virtualizedChain.length - 1];
            if (calcDaysApart(lastMessage.Created, chainPayload[0].Created) > 0) {
                if (!lastMessage.dateIndicator) lastMessage.totalWidth += DATE_INDICATOR_WIDTH;
                lastMessage.dateIndicator = chainPayload[0].Created;
            }

            let diff = chain.virtualizedChain.push(...chainPayload) - MAX_VIRTUAL_CHAIN_LENGTH;
            if (diff > 0) {
                let deleted = chain.virtualizedChain.splice(0, diff);
                let deletedTotalWidth = 0;
                for (let i = 0; i < deleted.length; i++) {
                    deletedTotalWidth += deleted[i].totalWidth;
                }
                chain.leftPadding += deletedTotalWidth
                chain.virtualIndex -= deleted.length;
            }
            
            chain.spaceBetween -= payload.chain.length;
            if (chain.spaceBetween <= 0) {
                chain.spaceBetween = 0;
                chain.attached = true;
            }
        },
        addDescExtraChain(state, { payload }) {
            let chain = state.chains[payload.index];
            if (!payload.chain) { 
                if (chain.virtualizedChain[0]) {
                    setNewPadding(0, chain.virtualizedChain[0].offset, chain);
                    chain.virtualizedChain[0].first = true;
                } else {
                    setNewPadding(0, chain.newestChain[0].offset, chain);
                    chain.newestChain[0].first = true;
                }
                return 
            };

            let diff = chain.virtualizedChain.unshift(...payload.chain) - MAX_VIRTUAL_CHAIN_LENGTH;
            chain.virtualIndex += payload.chain.length;

            if (diff > 0) {
                chain.virtualizedChain.splice(-diff, diff);
                chain.spaceBetween += diff;
                chain.attached = false;
            }

            if (payload.chain.length < EXTRA_CHAIN_LENGTH) {
                setNewPadding(0, chain.virtualizedChain[0].offset, chain);
                chain.virtualizedChain[0].first = true;
            } else if (payload.totalWidth <= chain.leftPadding - DEFAULT_LEFT_PLACEHOLDER_PADDING) {
                chain.leftPadding -= payload.totalWidth;
            } else {
                setNewPadding(INITIAL_LEFT_PADDING, chain.virtualizedChain[0].offset, chain);
            }
        },
        goToNewest(state, { payload }) {
            let chain = state.chains[payload.index];
            if (!chain.attached) {
                chain.isNewest = true;
                chain.virtualizedChain = [];
                chain.leftPadding = chain.newestChain[0].offset;
                chain.attached = true;
                chain.spaceBetween = 0;
                chain.virtualIndex = chain.newestChain.length - 1;
            }
        },
        setIsNewest(state, { payload }) {
            state.chains[payload.index].isNewest = payload.isNewest;
        },
        setVirtualIndex(state, { payload }) {
            state.chains[payload.index].virtualIndex = payload.virtualIndex;
        }
    }
});

export function parseAscChain(chain: any[], leftObject?: Chain , rightObject?: Chain): { chain: Chain[], totalWidth: number } {
    let tempChain: Chain[] = [];
    let startOffset = leftObject ? leftObject.offset + leftObject.totalWidth : INITIAL_LEFT_PADDING;
    let startKey = leftObject ? leftObject.key + 1 : 1;
    let totalNewWidth = 0;
    let display;
    let width;
    let daysApart;
    let nextCreated;
    let bytes: number[];
    for (let i = 0; i < chain.length; i++) {
        display = chain[i].Display as string
        bytes = [];
        for (let j = 0; j < display.length; j++) {
            bytes[j] = display.charCodeAt(j);
        }
        if (startKey > MESSAGES_TO_LOAD) {
            startKey = 1;
        }
        nextCreated = chain[i + 1]?.Created || (rightObject ? rightObject.Created : Date.now());
        daysApart = calcDaysApart(chain[i].Created, nextCreated);
        width = calculateAudioWidth(bytes.length) + (daysApart > 0 ? DATE_INDICATOR_WIDTH : 0);
        tempChain.push({
            MessageID: chain[i].MessageID,
            UserID: chain[i].UserID,
            Created: chain[i].Created,
            Duration: chain[i].Duration,
            Display: bytes,
            Seen: chain[i].Seen,
            Action: chain[i].Action,
            totalWidth: width,
            offset: startOffset + totalNewWidth,
            key: startKey,
            dateIndicator: daysApart > 0 ? nextCreated : undefined
        });
        startKey++;
        totalNewWidth += width;
    }
    //console.log(tempChain);
    return { chain: tempChain, totalWidth: totalNewWidth };
}

export function parseDescChain(chain: any[], rightObject: Chain): { chain: Chain[], totalWidth: number } {
    let tempChain: Chain[] = [];
    let startOffset = rightObject.offset;
    let startKey = rightObject.key - 1;
    let totalNewWidth = 0;
    let display;
    let width;
    let daysApart;
    let nextCreated;
    let bytes: number[];
    for (let i = chain.length - 1; i >= 0; i--) {
        display = chain[i].Display as string
        bytes = [];
        for (let j = 0; j < display.length; j++) {
            bytes[j] = display.charCodeAt(j);
        }
        if (startKey < 1) {
            startKey = MESSAGES_TO_LOAD
        }
        nextCreated = chain[i + 1]?.Created || (rightObject ? rightObject.Created : Date.now());
        daysApart = calcDaysApart(chain[i].Created, nextCreated);
        width = calculateAudioWidth(bytes.length) + (daysApart > 0 ? DATE_INDICATOR_WIDTH : 0);
        totalNewWidth += width;
        tempChain.unshift({
            MessageID: chain[i].MessageID,
            UserID: chain[i].UserID,
            Created: chain[i].Created,
            Duration: chain[i].Duration,
            Display: bytes,
            Seen: chain[i].Seen,
            Action: chain[i].Action,
            totalWidth: width,
            offset: startOffset - totalNewWidth,
            key: startKey,
            dateIndicator: daysApart > 0 ? nextCreated : undefined
        });
        startKey--;
    }
    return { chain: tempChain, totalWidth: totalNewWidth };
}

function pushMessage(chain: ChainContainer, payload: any) {
    if (chain.newestChain.length > 0) {
        let lastMessage = chain.newestChain[chain.newestChain.length - 1];
        if (calcDaysApart(lastMessage.Created, payload.chain.Created) > 0) {
            if (!lastMessage.dateIndicator) lastMessage.totalWidth += DATE_INDICATOR_WIDTH;
            lastMessage.dateIndicator = payload.chain.Created;
        }
    }

    let bytes: number[] = [];
    for (var i = 0; i < payload.chain.Display.length; i++) {
        bytes[i] = payload.chain.Display.charCodeAt(i);
    }
    let key = chain.newestChain[chain.newestChain.length - 1].key + 1;
    let length = chain.newestChain.push({
        MessageID: payload.chain.MessageID,
        UserID: payload.chain.UserID,
        Created: payload.chain.Created,
        Duration: payload.chain.Duration,
        Display: bytes,
        Seen: payload.chain.Seen,
        Action: payload.chain.Action,
        totalWidth: calculateAudioWidth(bytes.length),
        offset: chain.newestChain.length > 0 ? chain.newestChain[chain.newestChain.length - 1].offset + chain.newestChain[chain.newestChain.length - 1].totalWidth : chain.leftPadding,
        key: (key > MESSAGES_TO_LOAD ? 1 : key),
    });
    checkMaxSavedChain(length, chain);
}

function checkMaxSavedChain(scLength: number, chain: ChainContainer) {
    if (scLength > MAX_SAVED_CHAIN_LENGTH) {
        let shifted = chain.newestChain.shift()!;
        if (chain.attached) {
            chain.virtualizedChain.push(shifted);
            if (chain.virtualizedChain.length > EXTRA_CHAIN_LENGTH) {
                shifted = chain.virtualizedChain.shift()!;
                if (chain.virtualIndex > 0) {
                    chain.virtualIndex -= 1;
                }
                chain.leftPadding += shifted.totalWidth;
            }
        }
    }
}

function calculateAudioWidth(aryLength: number) {
    let width = 50 + (aryLength * CHAIN_METERS_WIDTH) + 10;
    width = Math.min(width, MESSAGE_MAX_WIDTH);
    width += MESSAGE_SPACER;
    return width;
}

function setNewPadding(newPadding: number, prevPadding: number, chain: ChainContainer) {
    let diff = newPadding - prevPadding;
    chain.leftPadding = newPadding;
    for (const message of chain.virtualizedChain) {
        message.offset += diff;
    } 
    for (const message of chain.newestChain) {
        message.offset += diff;
    }
}

export const userReducers = userSlice.reducer;
export const userActions = userSlice.actions;