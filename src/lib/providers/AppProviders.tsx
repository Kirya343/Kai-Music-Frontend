
import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { WebSocketProvider } from "./WebSocketProvider";

export const AppProviders = ({ children }: {children: ReactNode}) => {
    return (
        <AuthProvider>
            <WebSocketProvider>
                {children}
            </WebSocketProvider>
        </AuthProvider>
    );
};