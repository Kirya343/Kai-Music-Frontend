import { createContext, useContext } from "react";
import { GroupedMessages, IChat, IChatDetails, IChatMessage } from "../types/chat";

interface ChatsContextType {
    setAllMessages: React.Dispatch<React.SetStateAction<IChatMessage[] | null>>, 
    messages: GroupedMessages[] | null,
    currentChat: IChat | null,
    currentChatOpenId: string | null,
    setCurrentChatOpenId: React.Dispatch<React.SetStateAction<string | null>>,
    chats: IChat[] | null,
    setChats: React.Dispatch<React.SetStateAction<IChat[] | null>>,
    pushMessages: (messages: IChatMessage[] | IChatMessage) => void,
    unreadMessages: IChatMessage[] | null,
    pushDetails: (details: IChatDetails[]) => void,
    pushChats: (loadedChats: IChat[]) => void,
    updateChat: (update: IChat) => void,
}

export const ChatsContext = createContext<ChatsContextType | null>(null);

export const useChats = () => {
    const ctx = useContext(ChatsContext);
    if (!ctx) {
        throw new Error("useChats must be used inside ChatsProvider");
    }
    return ctx;
}