export interface UserState {
    username: string;
    userID: string;
    statement: string;
    relations: {
        Friends: Friend[];
        Requests: Requests[];
    };
    chains: Chain[];
    curChainsIndex: number[];
    selectedUserKey: number;
    currentUserKey: number;
}

export interface Chain {
    newestChain: Message[];
    virtualizedChain: Message[];
    spaceBetween: number;
    isNewest: boolean;
    virtualIndex: number;
    initOffset: number;
}

export interface User {
    Username: string;
    UserID: string;
    Statement: string;
}

export interface Requests {
    Username: string;
    RelationID: string;
    ChainID: string;
    Requested: boolean;
}

export interface Friend {
    Username: string;
    RelationID: string;
    ChainID: string;
    LastSeen: number;
    LastRecv: number;
    Key: number;
    newMessages: number;
}

export interface Message {
    MessageID: string;
    UserID: string;
    Created: number;
    Duration: number;
    Seen: boolean;
    Action: number;
    Display: number[];
    totalWidth: number;
    dateIndicatorWidth: number;
    offset: number;
    key: number;
    dateIndicatorCreated?: number;
    first?: boolean;
}