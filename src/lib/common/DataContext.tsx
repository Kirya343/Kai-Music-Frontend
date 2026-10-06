import { createContext, useContext, useEffect } from "react";
import { Playlist } from "../playlist";
import { IAudio } from "@audio";
import { useAudioData } from "@audio/hooks";
import { usePlaylistsData } from "../playlist/hooks";

interface DataContextType {
    playlists: Playlist[];
    audios: IAudio[];
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

    const { audios, syncAudios } = useAudioData();
    const { playlists, syncPlaylists } = usePlaylistsData();

    useEffect(() => {
        syncPlaylists()
        syncAudios()
    }, []);

    return (
        <DataContext.Provider value={{
            audios,
            playlists
         }}>
            {children}
        </DataContext.Provider>
    );
};