
import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { WebSocketProvider } from "./WebSocketProvider";
import { ListeningRoomProvider } from "./ListeningRoomProvider";
import { ChatsProvider } from "./ChatsProvider";

export const AppProviders = ({ children }: {children: ReactNode}) => {
    return (
        <AuthProvider>
            <WebSocketProvider>
                <ListeningRoomProvider>
                    <ChatsProvider>
                        {children}
                    </ChatsProvider>
                </ListeningRoomProvider>
            </WebSocketProvider>
        </AuthProvider>
    );
};