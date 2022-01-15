
export interface AuthState {
    verifying: boolean;
    sessionID: string;
    refreshToken: RefreshToken;
    accessToken: string;
    deviceToken: string;
    email: string;
}

export interface RefreshToken {
    token: string;
    expireAt: number;
}

export interface Authenticated {
    authenticated: boolean;
}