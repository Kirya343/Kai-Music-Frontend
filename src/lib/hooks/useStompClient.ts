"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { Client, Frame } from "@stomp/stompjs";
import { API_BASE } from "@/config";
import { useAuth } from "../contexts/AuthContext";
import { refreshToken } from "@/lib";

interface UseStompClientResult {
    client: Client | null;
    connected: boolean;
    error: boolean;
}

export function useStompClient(): UseStompClientResult {
    const { user } = useAuth();

    const clientRef = useRef<Client | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [client, setClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const maxReconnects = 3;

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
                new WebSocket(`${API_BASE?.replace(/^http/, "ws")}/ws`),
            reconnectDelay: 0,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        });

        stompClient.onConnect = () => {
            clientRef.current = stompClient;
            setClient(stompClient);
            setConnected(true);
            setError(false);
            setReconnectAttempts(0);
        };

        stompClient.onDisconnect = () => {
            setConnected(false);
        };

        stompClient.onStompError = async (frame: Frame) => {
            const message = frame?.headers?.message || "Unknown STOMP error";
            console.error("❌ Broker error:", message);

            if (!message.includes("invalidToken")) {
                setError(true);
                return;
            }

            const tokenRefreshed = await refreshToken();
            if (!tokenRefreshed?.ok) {
                setError(true);
                return;
            }

            cleanupClient();
            connect();
        };

        stompClient.onWebSocketClose = async (evt: CloseEvent) => {
            setConnected(false);

            if (evt.code === 1000 || reconnectAttempts >= maxReconnects) {
                setError(reconnectAttempts >= maxReconnects);
                return;
            }

            const tokenRefreshed = await refreshToken();
            if (!tokenRefreshed?.ok) {
                setError(true);
                return;
            }

            const delay = 2000 * (reconnectAttempts + 1);

            reconnectTimer.current = setTimeout(() => {
                setReconnectAttempts(prev => prev + 1);
                cleanupClient();
                connect();
            }, delay);
        };

        stompClient.activate();
    }, [user, reconnectAttempts, cleanupClient]);

    useEffect(() => {
        if (!user) return;

        connect();

        return () => {
            cleanupClient();
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
        };
    }, [user, connect, cleanupClient]);

    return {
        client,
        connected,
        error,
    };
}