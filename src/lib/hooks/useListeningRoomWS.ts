import { useCallback, useEffect, useState } from "react";
import { useAuth, useWebSocket } from "../contexts";
import { IPlaybackState } from "../types";
import { audioService } from "../services/audio";

export const useListeningRoomWS = (roomId: number | null) => {
    
    const { client, connected } = useWebSocket();
    const { isAuthenticated } = useAuth();
    const [playbackState, setPlaybackState] = useState<IPlaybackState | null>(null);

    useEffect(() => {
        async function loadState(roomId: number) {
            const data: IPlaybackState = await audioService.getCurrentRoomState(roomId);
            setPlaybackState(data);
        }

        if (roomId) loadState(roomId)
    }, [roomId])

    const updateTrackPosition = useCallback(async (entryId: number, position: number, pause: boolean) => {
        if (!client || !connected || !isAuthenticated) return;

        if (!entryId) return;

        const state: IPlaybackState = {entryId, position, pause};

        //console.log("Отправляем обновление позиции: ", state)
        client.publish({
            destination: `/app/room/${roomId}/update-playback-state`,
            body: JSON.stringify(state)
        });
    }, [client, connected, isAuthenticated, roomId])

    const playNext = () => {
        console.log("попытка переключить песню вперёд")
        if (!client || !connected || !isAuthenticated) return;
        client.publish({
            destination: `/app/room/${roomId}/next`,
            body: ""
        });
    }
    const playPrev = () => {
        console.log("попытка переключить песню назад")
        if (!client || !connected || !isAuthenticated) return;
        client.publish({
            destination: `/app/room/${roomId}/prev`,
            body: ""
        });
    }

    useEffect(() => {

        if (!client || !connected || !isAuthenticated) return;

        if (!roomId) return;

        //console.log("Подписались на комнату: ", roomId)

        const roomSub = client.subscribe(`/topic/room/${roomId}`, (message) => {
            const state: IPlaybackState = JSON.parse(message.body);
            //console.log("Пришло обновление комнаты: ", roomId, state)
            
            setPlaybackState(state);
        });

        return () => {
            roomSub.unsubscribe();
        }
    }, [client, connected, isAuthenticated, roomId]);

    return {playbackState, updateTrackPosition, playNext, playPrev};
}