
import { ReactNode } from "react";
import { GlobalProvider } from "@common";

export const AppProviders = ({ children }: {children: ReactNode}) => {
    return (
        <GlobalProvider>
            {children}
        </GlobalProvider>
    );
};