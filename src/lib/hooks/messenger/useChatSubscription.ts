import { useEffect, useRef } from "react";
import { IMessage } from '@stomp/stompjs';
import { useAuth, useChats, useWebSocket } from "@/lib/contexts";

export function useChatSubscription() {

    const { currentChatOpenId, pushMessages } = useChats();
    const { client, connected } = useWebSocket();
    const { user, isAuthenticated } = useAuth();

    const requestedRef = useRef<Set<string>>(new Set());
    const loadedRef = useRef<Set<string>>(new Set());

    // reset при смене пользователя
    useEffect(() => {
        requestedRef.current.clear();
        loadedRef.current.clear();
    }, [user?.openId]);

    // общая подписка (новые сообщения + unread)
    useEffect(() => {
        if (!client || !connected || !isAuthenticated) return;

        const sub = client.subscribe(`/user/queue/chat/messages`, (res: IMessage) => {
            pushMessages(JSON.parse(res.body));
        });

        client.publish({ destination: `/app/messages.get-unread` });

        return () => sub.unsubscribe();
    }, [connected, isAuthenticated, pushMessages]);

    // история конкретного чата
    useEffect(() => {
        if (!client || !connected || !isAuthenticated || !currentChatOpenId) return;

        const sub = client.subscribe(
            `/user/queue/chat/history.messages/${currentChatOpenId}`,
            (res: IMessage) => {
                pushMessages(JSON.parse(res.body));
                loadedRef.current.add(currentChatOpenId);
            }
        );

        return () => sub.unsubscribe();
    }, [connected, isAuthenticated, currentChatOpenId, pushMessages]);

    // триггер загрузки истории
    useEffect(() => {
        if (!client || !connected || !isAuthenticated || !currentChatOpenId) return;

        if (requestedRef.current.has(currentChatOpenId)) return;

        requestedRef.current.add(currentChatOpenId);

        client.publish({ destination: `/app/chat.loadMessages/${currentChatOpenId}` });
    }, [connected, isAuthenticated, currentChatOpenId]);
}