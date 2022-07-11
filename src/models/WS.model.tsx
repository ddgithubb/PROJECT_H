
export interface WSMessage {
    Op: number;
    OriginID?: string;
    TargetID?: string;
    Timestamp?: number;
    Signature?: string;
    Atomic?: boolean;
    Data: any;
}

export interface ReplyAuthTokenData {
    Token: string;
    PrevWSID: string;
}

export interface AuthResponseData {
    WSID: string;
    Refresh: boolean;
}

export interface ACKData {
    Timestamp: number;
    Signature: string;
}

export interface RefreshChainData {
    ChainID: string;
}

export interface FriendRequestData {
    OriginUsername: string;
    TargetUsername: string;
}

export interface FriendAcceptedData {
    ChainID: string;
    Created: number;
}

export interface SendMessageData {
    ChainID: string;
    MessageID: string;
    Created: number;
    Expires: number;
    Type: number;
    Seen: boolean;
    Display: string;
    Duration: number;
}