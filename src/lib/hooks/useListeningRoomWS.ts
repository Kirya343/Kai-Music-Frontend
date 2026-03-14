import { useCallback, useEffect, useState } from "react";
import { useAuth, useWebSocket } from "../contexts";
import { IPlaybackState } from "../types";

export const useListeningRoomWS = (roomId: number | null) => {
    
    const { client, connected } = useWebSocket();
    const { isAuthenticated } = useAuth();
    const [playbackState, setPlaybackState] = useState<IPlaybackState | null>(null);

    const updateTrackPosition = useCallback(async (audioId: number, position: number, pause: boolean) => {
        if (!client || !connected || !isAuthenticated) return;

        if (!audioId) return;

        const state: IPlaybackState = {audioId, position, pause};

        console.log("Отправляем обновление позиции: ", state)
        client.publish({
            destination: `/app/room/${roomId}/update-playback-state`,
            body: JSON.stringify(state)
        });
    }, [client, connected, isAuthenticated])

    useEffect(() => {

        if (!client || !connected || !isAuthenticated) return;

        if (!roomId) return;

        console.log("Подписались на комнату: ", roomId)

        const roomSub = client.subscribe(`/topic/room/${roomId}`, (message) => {
            const state: IPlaybackState = JSON.parse(message.body);
            setPlaybackState(state);
        });

        return () => {
            roomSub.unsubscribe();
        }
    }, [client, connected, isAuthenticated]);

    return {playbackState, updateTrackPosition};
}