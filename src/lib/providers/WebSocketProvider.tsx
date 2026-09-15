"use client";

import { useAuth, WebSocketContext } from "@/lib";
import { ReactNode } from "react";
import { useStompClient } from "@/lib";

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const { client, connected, error } = useStompClient();
    const { isAuthenticated } = useAuth();

    const isReady = Boolean(client && connected && isAuthenticated);

    return (
        <WebSocketContext.Provider value={{ client, error, isReady }}>
            {children}
        </WebSocketContext.Provider>
    );
};