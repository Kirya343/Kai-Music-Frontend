"use client";

import { WebSocketContext } from "@/lib";
import { ReactNode } from "react";
import { useStompClient } from "@/lib";

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const { client, connected, error } = useStompClient();

    return (
        <WebSocketContext.Provider value={{ client, connected, error }}>
            {children}
        </WebSocketContext.Provider>
    );
};