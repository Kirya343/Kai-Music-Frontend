"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { Client, Frame } from "@stomp/stompjs";

import { API_BASE } from "@/config";
import { useAuth } from "@auth";
import { api } from "@common";

interface UseStompClientResult {
    client: Client | null;
    connected: boolean;
    error: boolean;
    addOnConnectHandler(handler: (client: Client) => void): () => void;
}

export function useStompClient(): UseStompClientResult {
    const { user } = useAuth();

    const clientRef = useRef<Client | null>(null);

    const [client, setClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(false);

    type Cleanup = () => void;
    type OnConnectHandler = (client: Client) => void | Cleanup;

    const handlers = useRef(new Set<OnConnectHandler>());
    const cleanups = useRef(new Map<OnConnectHandler, Cleanup>());

    const cleanupClient = useCallback(() => {
        if (!clientRef.current) return;

        try {
            clientRef.current.deactivate();
        } catch (e) {
            console.warn("⚠️ Error during cleanup:", e);
        }

        clientRef.current = null;
        setClient(null);
        setConnected(false);
    }, []);

    const connect = useCallback(async () => {
        if (!user) return;
        if (!API_BASE) return;
        if (clientRef.current?.active) return;

        const stompClient = new Client({
            webSocketFactory: () =>
                new WebSocket(
                    `${API_BASE.replace(/^http/, "ws")}/ws`
                ),

            reconnectDelay: 1000,

            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        });

        stompClient.onConnect = () => {
            clientRef.current = stompClient;

            setClient(stompClient);
            setConnected(true);
            setError(false);

            console.log("Подключение")

            for (const handler of handlers.current) {
                cleanups.current.get(handler)?.();

                const cleanup = handler(stompClient);

                if (cleanup) {
                    cleanups.current.set(handler, cleanup);
                } else {
                    cleanups.current.delete(handler);
                }
            }
        };

        stompClient.onDisconnect = () => {
            setConnected(false);
        };

        stompClient.onStompError = async (frame: Frame) => {
            const message =
                frame?.headers?.message || "Unknown STOMP error";

            console.error("❌ Broker error:", message);

            if (!message.includes("invalidToken")) {
                setError(true);
                return;
            }

            try {
                await api.post("/auth/refresh", null, {})
            } catch (e) {
                setError(true);
                return;
            }

            stompClient.deactivate();
            connect();
        };

        stompClient.onWebSocketClose = () => {
            setConnected(false);
        };

        stompClient.activate();
    }, [user, cleanupClient]);

    const addOnConnectHandler = useCallback(
        (handler: OnConnectHandler): Cleanup => {
            handlers.current.add(handler);

            if (clientRef.current?.connected) {
                const cleanup = handler(clientRef.current);

                if (cleanup) {
                    cleanups.current.set(handler, cleanup);
                }
            }

            return () => {
                cleanups.current.get(handler)?.();
                cleanups.current.delete(handler);
                handlers.current.delete(handler);
            };
        },
        []
    );

    useEffect(() => {

        console.log(user)
        if (!user) return;

        connect();

        return () => {
            cleanupClient();
        };
    }, [user, connect, cleanupClient]);

    return {
        client,
        connected,
        error,
        addOnConnectHandler
    };
}