import { IShortUser } from "./user";

export interface IChat {
    chatName: string;
    openId: string;
    interlocutors: IShortUser[];
    lastMessage: IChatMessage | null;
}

export interface GroupedMessages {
    openId: string;
    senderOpenId: string;
    messages: IChatMessage[];
}

export interface IChatMessage {
    senderOpenId: string;
    openId: string;
    content: string;
    timestamp: string;
    chatOpenId: string;
    read: boolean;
}

export interface IChatDetails {
    chatOpenId: string;
    interlocutors: IShortUser[];
}