
import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { WebSocketProvider } from "./WebSocketProvider";
import { ListeningRoomProvider } from "./ListeningRoomProvider";
import { GlobalProvider } from "./GlobalProvider";

export const AppProviders = ({ children }: {children: ReactNode}) => {
    return (
        <GlobalProvider>
            <AuthProvider>
                <WebSocketProvider>
                    <ListeningRoomProvider>
                        {children}
                    </ListeningRoomProvider>
                </WebSocketProvider>
            </AuthProvider>
        </GlobalProvider>
    );
};