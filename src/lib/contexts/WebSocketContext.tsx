"use client"

import { createContext, ReactNode, useContext } from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "./AuthContext";
import { useStompClient } from "../hooks";

interface WebSocketContextProps {
    client: Client | null;
    error: boolean;
    isReady: boolean;
    addOnConnectHandler(handler: (client: Client) => void): () => void;
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);

export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) {
        throw new Error("useWebSocket must be used inside WebSocketProvider");
    }
    return ctx;
}

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const { client, connected, error, addOnConnectHandler } = useStompClient();
    const { isAuthenticated } = useAuth();

    const isReady = Boolean(client && connected && isAuthenticated);

    return (
        <WebSocketContext.Provider value={{ client, error, isReady, addOnConnectHandler }}>
            {children}
        </WebSocketContext.Provider>
    );
};