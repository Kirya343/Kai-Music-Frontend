
import { ReactNode } from "react";
import { DataProvider, GlobalProvider } from "@common";
import { AuthProvider } from "@auth";
import { WebSocketProvider } from "@websocket";
import { RoomPlaybackProvider } from "@playback";

export const AppProviders = ({ children }: {children: ReactNode}) => {
    return (
        <GlobalProvider>
            <AuthProvider>
                <WebSocketProvider>
                    <DataProvider>
                        <RoomPlaybackProvider>
                            {children}
                        </RoomPlaybackProvider>
                    </DataProvider>
                </WebSocketProvider>
            </AuthProvider>
        </GlobalProvider>
    );
};