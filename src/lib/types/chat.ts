import { ChatTypeValue } from "../constants/chatTypes";
import { IShortUser } from "./user";

export interface IChat {
    name: string;
    type: ChatTypeValue;
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