import { createContext, useContext } from "react";
import { IListeningRoom, IPlaybackState } from "../types";

interface ListeningRoomContextType {
    playbackState: IPlaybackState | null;
    room: IListeningRoom | null;
    updateTrackPosition: (audioId: number, position: number, pause: boolean) => void;
    addToQueue: (audioId: number) => void;
    removeFromQueue: (audioId: number) => void;
}

export const ListeningRoomContext = createContext<ListeningRoomContextType | null>(null);

export const useListeningRoom = () => {
    const ctx = useContext(ListeningRoomContext);
    if (!ctx) {
        throw new Error("useListeningRoom must be used inside AuthProvider");
    }
    return ctx;
}