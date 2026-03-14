
import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { WebSocketProvider } from "./WebSocketProvider";
import { ListeningRoomProvider } from "./ListeningRoomProvider";

export const AppProviders = ({ children }: {children: ReactNode}) => {
    return (
        <AuthProvider>
            <WebSocketProvider>
                <ListeningRoomProvider>
                    {children}
                </ListeningRoomProvider>
            </WebSocketProvider>
        </AuthProvider>
    );
};