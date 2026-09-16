
import { ReactNode } from "react";
import { 
    AuthProvider, GlobalProvider
} from "./lib/contexts";

export const AppProviders = ({ children }: {children: ReactNode}) => {
    return (
        <GlobalProvider>
            {children}
        </GlobalProvider>
    );
};