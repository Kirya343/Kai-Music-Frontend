"use client"

import { createContext, useContext } from "react";
import { Client } from "@stomp/stompjs";

interface WebSocketContextProps {
    client: Client | null;
    connected: boolean;
}

export const WebSocketContext = createContext<WebSocketContextProps | null>(null);

export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) {
        throw new Error("useWebSocket must be used inside WebSocketProvider");
    }
    return ctx;
}