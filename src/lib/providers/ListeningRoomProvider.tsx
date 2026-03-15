import { ListeningRoomContext } from "../contexts";
import { useListeningRoomWS } from "../hooks/useListeningRoomWS";
import { audioService } from "../services/audio";

export const ListeningRoomProvider = ({ children }: { children?: React.ReactNode }) => {

    const { room, addToQueue, removeFromQueue, loadRoom } = audioService.useCurrentRoom();
    const { playbackState, updateTrackPosition } = useListeningRoomWS(room?.id || null);

    return (
        <ListeningRoomContext.Provider value={{ playbackState, room, updateTrackPosition, addToQueue, removeFromQueue, loadRoom}}>
            {children}
        </ListeningRoomContext.Provider>
    );
};