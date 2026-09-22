import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

interface GlobalContextType {
    started: boolean;
    setStarted: Dispatch<SetStateAction<boolean>>;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const useGlobal = () => {
    const ctx = useContext(GlobalContext);
    if (!ctx) {
        throw new Error("useGlobal must be used inside GlobalProvider");
    }
    return ctx;
}

export const GlobalProvider = ({ children }: { children?: React.ReactNode }) => {

    const [started, setStarted] = useState<boolean>(false);

    return (
        <GlobalContext.Provider value={{
            started,
            setStarted
         }}>
            {children}
        </GlobalContext.Provider>
    );
};