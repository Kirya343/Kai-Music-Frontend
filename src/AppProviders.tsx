
import { ReactNode } from "react";
import { 
    AuthProvider, GlobalProvider, 
    WebSocketProvider, ListeningRoomProvider 
} from "./lib/contexts";

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