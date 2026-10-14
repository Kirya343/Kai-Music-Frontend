import { createContext, useContext, useEffect } from "react";
import { CreatePlaylist, Playlist, usePlaylistsData } from "@playlist";
import { IAudio, useAudioData } from "@audio";
import { IQueueItem } from "@playback";

/**
 * Defines the acpplication data context.
 */
interface DataContextType {
    playlists: IPlaylistsData;
    audios: IAudiosData;
}


/**
 * Defines the playlist data and available operations.
 */
interface IPlaylistsData {
    /** List of available playlists. */
    data: Playlist[];

    /** Synchronizes playlists with the server. */
    syncPlaylists: () => void;

    /** Deletes a playlist. */
    deletePlaylist: (playlist: Playlist) => void;

    /** Creates a new playlist. */
    createPlaylist: (playlist: CreatePlaylist) => void;

    /** Imports tracks from one playlist into another. */
    importToRoom: (importPlaylist: Playlist, targetPlaylist: Playlist) => void;

    /** Removes a track from a playlist. */
    removeAudio: (playlistId: number, queueItem: IQueueItem) => void;
}

/**
 * Defines the audio data and available operations.
 */
interface IAudiosData {
    /** List of available audio tracks. */
    data: IAudio[];

    /** Synchronizes audio tracks with the server. */
    syncAudios: () => void;

    /** Deletes audio */
    deleteAudio: (audio: IAudio) => void;

    /** Updates audio metadata */
    updateAudio: (audio: IAudio) => void;
}

/**
 * Context for accessing application-wide data.
 *
 * Provides access to audio and playlist data managed by their respective hooks.
 */
const DataContext = createContext<DataContextType | null>(null);

/**
 * Returns the application data context.
 *
 * @throws {Error} If called outside DataProvider.
 */
export const useData = () => {
    const ctx = useContext(DataContext);
    if (!ctx) {
        throw new Error("useGlobal must be used inside GlobalProvider");
    }
    return ctx;
}

/**
 * Provides access to application-wide data through DataContext.
 *
 * Initializes audio and playlist synchronization when mounted.
 */
export const DataProvider = ({ children }: { children?: React.ReactNode }) => {

    const audios = useAudioData();
    const playlists = usePlaylistsData();

    useEffect(() => {
        playlists.syncPlaylists();
        audios.syncAudios();
    }, [playlists.syncPlaylists, audios.syncAudios]);

    return (
        <DataContext.Provider value={{
            audios,
            playlists
         }}>
            {children}
        </DataContext.Provider>
    );
};