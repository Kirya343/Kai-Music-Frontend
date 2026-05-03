import { GroupedMessages, IChat, IChatDetails, IChatMessage } from "@/lib/types/chat";
import { useCallback, useMemo, useState } from "react";

export default function useChatsState() {
    const [currentChatOpenId, setCurrentChatOpenId] = useState<string | null>(null);
    const [chats, setChats] = useState<IChat[] | null>(null);
    const [allMessages, setAllMessages] = useState<IChatMessage[] | null>(null);

    const currentChat = useMemo<IChat | null>(
        () => chats?.find(c => c.openId === currentChatOpenId) ?? null,
        [chats, currentChatOpenId]);

    const prepareMessages = useCallback((rawMessages: IChatMessage[]) => {
        const grouped: { senderOpenId: string; messages: IChatMessage[], openId: string}[] = [];

        for (const msg of rawMessages) {
            const last = grouped[grouped.length - 1];

            if (last && last.senderOpenId === msg.senderOpenId) {
                last.messages.push(msg);
            } else {
                grouped.push({
                    senderOpenId: msg.senderOpenId,
                    messages: [msg],
                    openId: msg.openId
                });
            }
        }

        return grouped;
    }, []);

    const messages = useMemo<GroupedMessages[] | null>(() => {
        if (!allMessages) return null;

        const filtered = allMessages
            .filter(m => m.chatOpenId === currentChatOpenId && m.timestamp)
            .sort((a, b) =>
                new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
            );

        return prepareMessages(filtered);
    }, [allMessages, currentChatOpenId]);

    const pushMessages = useCallback((messages: IChatMessage[] | IChatMessage) => {
    
        setAllMessages(prev => {
            if (!prev) prev = [];
            const messagesToAdd = Array.isArray(messages) ? messages : [messages];

            // создаём карту текущих сообщений по id
            const messagesMap = new Map(prev?.map(m => [m.openId, m]));

            // обновляем карту новыми/заменяем существующие
            messagesToAdd.forEach(m => {
                messagesMap.set(m.openId, m);
            });

            // возвращаем массив сообщений в том же порядке, что и в карте
            return Array.from(messagesMap.values());
        });
    }, []);

    const pushDetails = useCallback((details: IChatDetails[]) => {
        // console.log("детализируем чаты")
        setChats(prev =>
            prev?.map(chat => {
                const detailsForChat = details.find(d => d.chatOpenId === chat.openId);
                // console.log("detailsForChat", detailsForChat)
                // console.log("chat", chat)
                if (!detailsForChat) return chat;

                // console.log("updatedchat", { ...chat, ...detailsForChat })
                return { ...chat, ...detailsForChat };
            }) ?? null
        );
    }, []);

    const pushChats = useCallback((loadedChats: IChat[]) => {
        setChats(prev => {
            const map = new Map(prev?.map(c => [c.openId, c]));

            loadedChats.forEach(chat => {
                const existing = map.get(chat.openId);

                if (existing) {
                    map.set(chat.openId, {
                        ...existing,   // сохраняем детали
                        ...chat        // обновляем базовые поля
                    });
                } else {
                    map.set(chat.openId, chat);
                }
            });

            return Array.from(map.values());
        });
    }, []);

    const updateChat = useCallback((update: IChat) => {
        setChats(prev => {
            if (!prev) return prev;

            const updatedChatsMap = new Map(prev.map(c => [c.openId, c]));

            const oldChat = updatedChatsMap.get(update.openId);

            if (oldChat) {
                // создаём новый объект, сохраняем oldChat.interlocutors и oldChat.listing
                updatedChatsMap.set(update.openId, {
                    ...update,
                    interlocutors: oldChat.interlocutors,
                });
            } else {
                // если чата ещё нет — просто добавляем
                updatedChatsMap.set(update.openId, update);
            }

            return Array.from(updatedChatsMap.values());
        });
    }, []);

    return {
        allMessages,
        setAllMessages, 
        messages,
        currentChat,
        currentChatOpenId,
        setCurrentChatOpenId,
        chats,
        setChats,
        pushMessages,
        pushDetails,
        pushChats,
        updateChat
    };
}