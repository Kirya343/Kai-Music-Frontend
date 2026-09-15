import { useCallback, useEffect, useState } from "react";
import { useAuth, useWebSocket } from "../contexts";
import { IAudio, IListeningRoom, IPlaybackState } from "../types";
import { audioService } from "../services/audio";
import { roomService } from "../services/room";

export const useListeningRoomWS = () => {
    
    const { client, connected } = useWebSocket();
    const { isAuthenticated } = useAuth();
    const [playbackState, setPlaybackState] = useState<IPlaybackState | null>(null);
    const [audioInfo, setAudioInfo] = useState<IAudio | null>(null);
    const [room, setRoom] = useState<IListeningRoom | null>(null);

    useEffect(() => {
        async function loadState(roomId: number) {
            const data: IPlaybackState = await roomService.getCurrentRoomState(roomId);
            setPlaybackState(data);
        }

        if (room?.id) loadState(room?.id)
    }, [room?.id])

    const updateTrackPosition = useCallback(async (entryId: number, position: number, pause: boolean) => {
        if (!client || !connected || !isAuthenticated) return;

        if (!entryId) return;

        const state: IPlaybackState = {entryId, position, pause};

        //console.log("Отправляем обновление позиции: ", state)
        client.publish({
            destination: `/app/room/${room?.id}/update-playback-state`,
            body: JSON.stringify(state)
        });
    }, [client, connected, isAuthenticated, room?.id])

    const playNext = () => {
        console.log("попытка переключить песню вперёд")
        if (!client || !connected || !isAuthenticated) return;
        client.publish({
            destination: `/app/room/${room?.id}/next`,
            body: ""
        });
    }
    const playPrev = () => {
        console.log("попытка переключить песню назад")
        if (!client || !connected || !isAuthenticated) return;
        client.publish({
            destination: `/app/room/${room?.id}/prev`,
            body: ""
        });
    }

    useEffect(() => {

        if (!client || !connected || !isAuthenticated) return;

        if (!room?.id) return;

        //console.log("Подписались на комнату: ", roomId)

        const playbackSub = client.subscribe(`/topic/room/playback/${room?.id}`, (message) => {
            const state: IPlaybackState = JSON.parse(message.body);
            //console.log("Пришло обновление комнаты: ", roomId, state)
            
            setPlaybackState(state);
        });

        return () => {
            playbackSub.unsubscribe();
        }
    }, [client, connected, isAuthenticated, room?.id]);
    
    useEffect(() => {
        async function loadAudioInfo(entryId: number) {
            const data = await audioService.loadAudioInfo(entryId);
            setAudioInfo(data);
        }

        if (playbackState?.entryId) loadAudioInfo(playbackState.entryId);
    }, [playbackState?.entryId]);

    const loadRoom = useCallback(async() => {

        if (!client || !connected || !isAuthenticated) return;

        console.log("загружаем комнату")

        client.publish({
            destination: `/app/room/load`,
            body: ""
        });
    }, [client, connected, isAuthenticated])

    const addToQueue = useCallback(async (audioId: number) => {
        if (!room) return;
        const data = await roomService.addToQueue(room.id, audioId);
        setRoom(p => {
            if (!p) return p;
            return {
                ...p,
                queue: [...p.queue, data] // добавляем новый элемент в конец массива
            };
        });
    }, [room])

    const removeFromQueue = useCallback(async (queueItemId: number) => {
        if (!room) return;
        const data = await roomService.removeFromQueue(room.id, queueItemId);
        setRoom(p => {
            if (!p) return p;
            return {
                ...p,
                queue: [...p.queue.filter(qi => qi.id != queueItemId)] // добавляем новый элемент в конец массива
            };
        });
    }, [room])

    useEffect(() => {
        console.log(!!client, !!connected, !!isAuthenticated)

        if (!client || !connected || !isAuthenticated) return;

        console.log("Подписались на комнату пользователя")

        const roomSub = client.subscribe(`/user/queue/room`, (message) => {
            const room: IListeningRoom = JSON.parse(message.body);
            console.log("Пришло обновление комнаты: ", room.id, room)
            
            setRoom(room);
        });

        loadRoom();

        return () => {
            roomSub.unsubscribe();
        }
    }, [client, connected, isAuthenticated])

    return {
        playbackState, 
        updateTrackPosition, 
        playNext, playPrev, 
        audioInfo,
        addToQueue, removeFromQueue,
        room, loadRoom
    };
}