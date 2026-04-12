import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { IListeningRoom, IPlaybackState } from "../types";

interface ListeningRoomContextType {
    playbackState: IPlaybackState | null;
    room: IListeningRoom | null;
    updateTrackPosition: (entryId: number, position: number, pause: boolean) => void;
    addToQueue: (entryId: number) => void;
    removeFromQueue: (entryId: number) => void;
    loadRoom: () => void;
    localPosition: number;
    setLocalPosition: Dispatch<SetStateAction<number>>;
    playNext: () => void;
    playPrev: () => void;
    roomLoaded: boolean;
    setRoomLoaded: Dispatch<SetStateAction<boolean>>;
}

export const ListeningRoomContext = createContext<ListeningRoomContextType | null>(null);

export const useListeningRoom = () => {
    const ctx = useContext(ListeningRoomContext);
    if (!ctx) {
        throw new Error("useListeningRoom must be used inside AuthProvider");
    }
    return ctx;
}