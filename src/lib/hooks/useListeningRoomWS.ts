import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "../contexts";
import { AudioChunk, IAudio, IListeningRoom, IPlaybackState } from "../types";
import { roomService } from "../services/room";

export const useListeningRoomWS = () => {
    
    const { client, isReady} = useWebSocket();
    const [playbackState, setPlaybackState] = useState<IPlaybackState | null>(null);
    const [audioInfo, setAudioInfo] = useState<IAudio | null>(null);
    const [room, setRoom] = useState<IListeningRoom | null>(null);
    const onAudioChunkRef = useRef<((chunk: AudioChunk) => void) | null>(null);

    useEffect(() => {
        async function loadState(roomId: number) {
            const data: IPlaybackState = await roomService.getCurrentRoomState(roomId);
            setPlaybackState(data);
        }

        if (room?.id) loadState(room?.id)
    }, [room?.id])

    const updateTrackPosition = useCallback(async (entryId: number, position: number, pause: boolean) => {
        if (!isReady) return;

        if (!entryId) return;

        const state: IPlaybackState = {entryId, position, pause};

        //console.log("Отправляем обновление позиции: ", state)
        client?.publish({
            destination: `/app/room/${room?.id}/update-playback-state`,
            body: JSON.stringify(state)
        });
    }, [client, isReady, room?.id])

    const playNext = () => {
        console.log("попытка переключить песню вперёд")
        if (!client || !isReady) return;
        client.publish({
            destination: `/app/room/${room?.id}/next`,
            body: ""
        });
    }
    const playPrev = () => {
        console.log("попытка переключить песню назад")
        if (!client || !isReady) return;
        client.publish({
            destination: `/app/room/${room?.id}/prev`,
            body: ""
        });
    }

    useEffect(() => {

        if (!isReady) return;

        if (!room?.id) return;

        //console.log("Подписались на комнату: ", roomId)

        const playbackSub = client?.subscribe(`/topic/room/playback/${room?.id}`, (message) => {
            const state: IPlaybackState = JSON.parse(message.body);
            //console.log("Пришло обновление комнаты: ", roomId, state)
            
            setPlaybackState(state);
        });

        const audioSub = client?.subscribe(`/topic/room/${room?.id}/audio`, (message) => {
            const chunk: AudioChunk = {
                bytes: message.binaryBody,
                sequence: Number(message.headers["sequence"]),
                duration: Number(message.headers["duration"]),
                initialization: message.headers["initialization"] === "true"
            };

            const audio: IAudio = {
                id: Number(message.headers["audioId"]),
                name: message.headers["audioName"],
                format: message.headers["audioFormat"],
                title: message.headers["audioTitle"],
                artist: message.headers["audioArtist"],
                album: message.headers["audioAlbum"],
                duration: Number(message.headers["audioDuration"]),
                coverUrl: message.headers["audioCoverUrl"]
            }

            //console.log("Пришла часть аудио", audio, chunk)

            setAudioInfo(audio);

            onAudioChunkRef.current?.(chunk);
        });

        return () => {
            playbackSub?.unsubscribe();
            audioSub?.unsubscribe();
        }
    }, [client, isReady, room?.id]);

    const loadRoom = useCallback(async() => {

        if (!isReady) return;

        console.log("загружаем комнату")

        client?.publish({
            destination: `/app/room/load`,
            body: ""
        });
    }, [client, isReady])

    const addToQueue = useCallback(async (audioId: number) => {
        if (!room) return;
        const data = await roomService.addToQueue(room.id, audioId);
        setRoom(p => {
            if (!p) return p;
            return {
                ...p,
                queue: [...p.queue, data]
            };
        });
    }, [room])

    const removeFromQueue = useCallback(async (queueItemId: number) => {
        if (!room) return;
        
        await roomService.removeFromQueue(room.id, queueItemId);

        setRoom(p => {
            if (!p) return p;
            return {
                ...p,
                queue: [...p.queue.filter(qi => qi.id != queueItemId)]
            };
        });
    }, [room])

    useEffect(() => {

        if (!isReady) return;

        const roomSub = client?.subscribe(`/user/queue/room`, (message) => {
            const room: IListeningRoom = JSON.parse(message.body);
            console.log("Пришло обновление комнаты: ", room.id, room)
            
            setRoom(room);
        });

        loadRoom();

        return () => {
            roomSub?.unsubscribe();
        }
    }, [client, isReady])

    const setAudioChunkHandler = useCallback(
        (handler: (chunk: AudioChunk) => void) => {
            onAudioChunkRef.current = handler;
        },
        []
    );

    return {
        playbackState, 
        updateTrackPosition, 
        playNext, playPrev, 
        audioInfo,
        addToQueue, removeFromQueue,
        room, loadRoom,
        setAudioChunkHandler
    };
}