import { useEffect, useMemo, useState } from "react";
import { ChatsContext, useAuth, useWebSocket } from "../contexts";
import { IChatMessage } from "../types/chat";
import useChatsState from "../hooks/messenger/useChatsState";

export const ChatsProvider = ({ children }: { children?: React.ReactNode }) => {

    const { user } = useAuth();
    const { allMessages, setAllMessages, messages, currentChat, 
        currentChatOpenId, setCurrentChatOpenId, chats, setChats, 
        pushMessages, pushDetails, pushChats, updateChat
    } = useChatsState();

    const { client, connected } = useWebSocket();

    const unreadMessages = useMemo<IChatMessage[] | null>(() => {
        if (!allMessages) return null;
        return allMessages.filter(m => m.read === false && m.senderOpenId != user?.openId);
    }, [allMessages]);

    useEffect(() => {
        setAllMessages(null);
        setCurrentChatOpenId(null);
        setChats(null);
    }, [user]);

    useEffect(() => {
        if (!currentChatOpenId || !client || !connected) return;

        client.publish({
            destination: `/app/chat.markAsRead/${currentChatOpenId}`
        });

        const url = new URL(window.location.href);
        url.searchParams.set("chatId", String(currentChatOpenId));
        window.history.pushState({}, '', url);
        
    }, [currentChatOpenId, client, connected]);

    return (
        <ChatsContext.Provider value={{
            setAllMessages, 
            messages,
            currentChat,
            currentChatOpenId,
            setCurrentChatOpenId,
            chats,
            setChats,
            pushMessages,
            unreadMessages,
            pushDetails,
            pushChats,
            updateChat
         }}>
            {children}
        </ChatsContext.Provider>
    );
};