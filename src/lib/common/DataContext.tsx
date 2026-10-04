import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { Playlist, playlistService } from "../playlist";
import { audioService, IAudio } from "@audio";
import { IListeningRoom } from "@room";
import { useAudioData } from "@audio/hooks";
import { usePlaylistsData } from "../playlist/hooks";
import { useRoomData } from "@room/hooks/useRoomData";
import { useRoomPlaylistData } from "../playlist/hooks/useRoomPlaylistData";

interface DataContextType {
    playlists: Playlist[];
    audios: IAudio[];
    room: IListeningRoom | null,
    setRoom: Dispatch<SetStateAction<IListeningRoom | null>>
    roomPlaylist: Playlist | null;
    setRoomPlaylist: Dispatch<SetStateAction<Playlist | null>>
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
    const { room, setRoom } = useRoomData();
    const { roomPlaylist, setRoomPlaylist } = useRoomPlaylistData();

    useEffect(() => {
        syncPlaylists()
        syncAudios()
    }, []);

    return (
        <DataContext.Provider value={{
            audios,
            playlists,
            room,
            setRoom,
            roomPlaylist,
            setRoomPlaylist
         }}>
            {children}
        </DataContext.Provider>
    );
};