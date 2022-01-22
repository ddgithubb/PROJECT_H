import { createSlice } from "@reduxjs/toolkit";
import { Message, Chain, UserState } from "../../models/User.model";
import { EXTRA_CHAIN_LENGTH, MAX_SAVED_CHAIN_LENGTH, MAX_VIRTUAL_CHAIN_LENGTH, DEFAULT_LEFT_PLACEHOLDER_PADDING, MESSAGE_MAX_WIDTH, MESSAGE_SPACER, DATE_INDICATOR_WIDTH, CHAIN_METERS_WIDTH, DISPLAY_DURATION_WIDTH  } from '../../config/constants';
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
                newestChain: parseChain(payload.chain, 1, Date.now()), 
                spaceBetween: 0, 
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
        addDescExtraChain(state, { payload }) {
            let chain = state.chains[payload.index];
            if (!payload.chain) {
                (chain.virtualizedChain[0] || chain.newestChain[0]).first = true;
                return 
            };

            let chainPayload = 
                parseChain(
                    payload.chain, 
                    MESSAGES_TO_LOAD - (payload.chain.length % MESSAGES_TO_LOAD) + (chain.virtualizedChain[0] || chain.newestChain[0]).key, 
                    (chain.virtualizedChain[0] || chain.newestChain[0]).Created
                );

            let diff = chain.virtualizedChain.unshift(...chainPayload) - MAX_VIRTUAL_CHAIN_LENGTH;
            chain.virtualIndex += chainPayload.length;

            if (diff > 0) {
                chain.virtualizedChain.splice(-diff, diff);
                chain.spaceBetween += diff;
            }

            if (payload.chain.length < EXTRA_CHAIN_LENGTH) {
                chain.virtualizedChain[0].first = true;
            }

            calculateOffset(chain);
        },
        addAscExtraChain(state, { payload }) {
            let chain = state.chains[payload.index];
            if (!chain || !payload.chain) return;

            let chainPayload = 
                parseChain(
                    payload.chain, 
                    chain.virtualizedChain[chain.virtualizedChain.length - 1].key + 1,
                    payload.chain.length < EXTRA_CHAIN_LENGTH ? chain.newestChain[0].Created : undefined,
                );

            updatePreviousMessageDateIndicator(chain.virtualizedChain[chain.virtualizedChain.length - 1], chainPayload[0].Created);

            let diff = chain.virtualizedChain.push(...chainPayload) - MAX_VIRTUAL_CHAIN_LENGTH;
            if (diff > 0) {
                chain.virtualizedChain.splice(0, diff);
                chain.virtualIndex -= diff;
            }
            
            chain.spaceBetween -= payload.chain.length;
            if (chain.spaceBetween <= 0) {
                chain.spaceBetween = 0;
            }

            calculateOffset(chain);
        },
        goToNewest(state, { payload }) {
            let chain = state.chains[payload.index];
            chain.isNewest = true;
            chain.virtualizedChain = [];
            chain.spaceBetween = 0;
            chain.virtualIndex = chain.newestChain.length - 1;
            calculateOffset(chain);
        },
        setIsNewest(state, { payload }) {
            state.chains[payload.index].isNewest = payload.isNewest;
        },
        setVirtualIndex(state, { payload }) {
            state.chains[payload.index].virtualIndex = payload.virtualIndex;
        }
    }
});

export function parseChain(chain: any[], startKey: number, nextCreated?: number): Message[] {
    let tempChain: Message[] = [];
    let totalNewWidth = 0;
    let startOffset = 0;
    let display;
    let width;
    let indicatorWidth;
    let daysApart;
    let bytes: number[];
    for (let i = 0; i < chain.length; i++) {
        display = chain[i].Display as string
        bytes = [];
        for (let j = 0; j < display.length; j++) {
            bytes[j] = display.charCodeAt(j);
        }
        if (startKey > MESSAGES_TO_LOAD) startKey = startKey - MESSAGES_TO_LOAD;
        nextCreated = chain[i + 1]?.Created || (nextCreated || chain[i].Created);
        daysApart = calcDaysApart(chain[i].Created, nextCreated);
        indicatorWidth = calculateDateIndicatorWidth(daysApart);
        width = calculateAudioWidth(bytes.length) + indicatorWidth;
        tempChain.push({
            MessageID: chain[i].MessageID,
            UserID: chain[i].UserID,
            Created: chain[i].Created,
            Duration: chain[i].Duration,
            Display: bytes,
            Seen: chain[i].Seen,
            Action: chain[i].Action,
            totalWidth: width,
            dateIndicatorWidth: indicatorWidth,
            offset: startOffset + totalNewWidth,
            key: startKey,
            dateIndicatorCreated: indicatorWidth > 0 ? nextCreated : undefined,
        });
        startKey++;
        totalNewWidth += width;
    }
    return tempChain;
}

function pushMessage(chain: Chain, payload: any) {
    if (chain.newestChain.length > 0) updatePreviousMessageDateIndicator(chain.newestChain[chain.newestChain.length - 1], payload.chain.Created);

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
        dateIndicatorWidth: 0,
        offset: 0,
        key: (key > MESSAGES_TO_LOAD ? 1 : key),
    });
    
    if (length > MAX_SAVED_CHAIN_LENGTH) {
        chain.newestChain.shift()!;
        if (chain.spaceBetween != 0) chain.spaceBetween++;
        calculateOffset(chain);
    }
}

function calculateOffset(chain: Chain) {
    let tempOffset = 0;
    let vcLength = chain.virtualizedChain.length;
    for (let i = 0; i < vcLength + (chain.spaceBetween == 0 ? chain.newestChain.length : 0); i++) {
        if (i >= vcLength) {
            chain.newestChain[i - vcLength].offset = tempOffset;
            tempOffset += chain.newestChain[i - vcLength].totalWidth;
        } else {
            chain.virtualizedChain[i].offset = tempOffset;
            tempOffset += chain.virtualizedChain[i].totalWidth;
        }
    }
}

function calculateAudioWidth(aryLength: number) {
    let width = DISPLAY_DURATION_WIDTH + (aryLength * CHAIN_METERS_WIDTH) + 10;
    width = Math.min(width, MESSAGE_MAX_WIDTH);
    width += MESSAGE_SPACER;
    return width;
}

function updatePreviousMessageDateIndicator(lastMessage: Message, nextCreated: number) {
    let daysApart = calcDaysApart(lastMessage.Created, nextCreated);
    if (daysApart > 0) {
        let newDateIndicatorWidth = calculateDateIndicatorWidth(daysApart);
        lastMessage.totalWidth -= lastMessage.dateIndicatorWidth;
        lastMessage.totalWidth += newDateIndicatorWidth;
        lastMessage.dateIndicatorWidth = newDateIndicatorWidth;
        lastMessage.dateIndicatorCreated = nextCreated;
    }
}

function calculateDateIndicatorWidth(daysApart: number) {
    if (daysApart < 1) return 0;
    return Math.ceil((((2 * (daysApart - 1))/(daysApart + 20)) + 1) * DATE_INDICATOR_WIDTH);
}

export const userReducers = userSlice.reducer;
export const userActions = userSlice.actions;