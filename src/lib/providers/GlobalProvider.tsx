import { useState } from "react";
import { GlobalContext } from "../contexts/GlobalContext";

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