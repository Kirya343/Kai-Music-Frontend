import { createContext, useContext, useEffect } from "react";
import { CreatePlaylist, Playlist } from "../playlist";
import { IAudio } from "@audio";
import { useAudioData } from "@audio/hooks";
import { usePlaylistsData } from "../playlist/hooks";
import { IQueueItem } from "@playback";

interface DataContextType {
    playlists: IPlaylistsData;
    audios: IAudiosData;
}

interface IPlaylistsData {
    data: Playlist[];
    syncPlaylists: () => void;
    deletePlaylist: (playlist: Playlist) => void;
    createPlaylist: (playlist: CreatePlaylist) => void;
    importToRoom: (importPlaylist: Playlist, targetPlaylist: Playlist) => void;
    removeAudio: (playlistId: number, queueItem: IQueueItem) => void
}

interface IAudiosData {
    data: IAudio[];
    syncAudios: () => void;
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

    const audios = useAudioData();
    const playlists = usePlaylistsData();

    useEffect(() => {
        playlists.syncPlaylists()
        audios.syncAudios()
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