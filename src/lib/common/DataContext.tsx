import { createContext, useContext, useState } from "react";
import { Playlist } from "../playlist";
import { IAudio } from "@audio";

interface DataContextType {
    playlists: Playlist[];
    tracks: IAudio[];
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) {
        throw new Error("useGlobal must be used inside GlobalProvider");
    }
    return ctx;
}

export const DataProvider = ({ children }: { children?: React.ReactNode }) => {

    const [audios, setAudios] = useState<IAudio[]>(() => {
        const saved = localStorage.getItem("libraryAudios");

        return saved ? JSON.parse(saved) : [];
    });



    return (
        <DataContext.Provider value={{
            audios
         }}>
            {children}
        </DataContext.Provider>
    );
};