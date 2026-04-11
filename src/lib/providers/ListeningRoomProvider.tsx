import { useState } from "react";
import { ListeningRoomContext } from "../contexts";
import { useListeningRoomWS } from "../hooks/useListeningRoomWS";
import { audioService } from "../services/audio";

export const ListeningRoomProvider = ({ children }: { children?: React.ReactNode }) => {

    const { room, addToQueue, removeFromQueue, loadRoom } = audioService.useCurrentRoom();
    const { playbackState, updateTrackPosition, playNext, playPrev} = useListeningRoomWS(room?.id || null);
    const [localPosition, setLocalPosition] = useState<number>(0);

    return (
        <ListeningRoomContext.Provider value={{ 
            playbackState, 
            room, 
            updateTrackPosition, 
            addToQueue, 
            removeFromQueue, 
            loadRoom,
            localPosition,
            setLocalPosition,
            playNext, 
            playPrev
        }}>
            {children}
        </ListeningRoomContext.Provider>
    );
};