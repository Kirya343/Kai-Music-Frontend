import { createContext, Dispatch, SetStateAction, useContext } from "react";

interface GlobalContextType {
    started: boolean;
    setStarted: Dispatch<SetStateAction<boolean>>;
}

export const GlobalContext = createContext<GlobalContextType | null>(null);

export const useGlobal = () => {
    const ctx = useContext(GlobalContext);
    if (!ctx) {
        throw new Error("useGlobal must be used inside GlobalProvider");
    }
    return ctx;
}