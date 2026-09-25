import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "@websocket";
import { AudioChunk, IAudio } from "@audio";
import { IListeningRoom } from "@room";
import { IPlaybackState, IQueueItemCreate } from "@playback";

export const useListeningRoomWS = () => {
    
    const { client, addOnConnectHandler} = useWebSocket();
    const [audioInfo, setAudioInfo] = useState<IAudio | null>(null);
    const [room, setRoom] = useState<IListeningRoom | null>(null);
    const onAudioChunkRef = useRef<((chunk: AudioChunk) => void) | null>(null);
    const playbackStateCallbackRef = useRef<((state: IPlaybackState) => void) | null>(null);

    const setAudioChunkHandler = useCallback(
        (handler: (chunk: AudioChunk) => void) => {
            onAudioChunkRef.current = handler;
        }, []);

    const setPlaybackStateCallback = useCallback(
        (callback: (state: IPlaybackState) => void) => {
            playbackStateCallbackRef.current = callback;
        }, []);

    const updateTrackPosition = useCallback(async (state: IPlaybackState) => {
        if (!client || !state || !room?.id) return;

        console.log("Отправляем обновление позиции: ", state, room?.id)

        client?.publish({
            destination: `/app/room/${room?.id}/update-playback-state`,
            body: JSON.stringify(state)
        });
    }, [client, room?.id])

    const playNext = () => {
        console.log("попытка переключить песню вперёд")

        if (!client) return;

        client.publish({ destination: `/app/room/${room?.id}/next` });
    }

    const playPrev = () => {
        console.log("попытка переключить песню назад")

        if (!client) return;

        client.publish({ destination: `/app/room/${room?.id}/prev` });
    }

    const addToQueue = useCallback((list: IQueueItemCreate[]) => {
        console.log("попытка переключить песню вперёд")

        if (!client) return;

        client.publish({ destination: `/app/room/queue.add`, body: JSON.stringify(list) });
    }, [client])

    const removeFromQueue = useCallback((list: number[]) => {
        console.log("попытка переключить песню вперёд")

        if (!client) return;

        client.publish({ destination: `/app/room/queue.remove`, body: JSON.stringify(list) });
    }, [client])

    const loadRoom = useCallback(async() => {
        console.log("загружаем комнату")

        if (!client) return;

        client.publish({ destination: `/app/room/load` });
    }, [client])

    useEffect(() => {
        const unsubscribe = addOnConnectHandler((client) => {

            const roomSub = client.subscribe(`/user/queue/room`, (message) => {
                const room: IListeningRoom = JSON.parse(message.body);
                //console.log("Пришло обновление комнаты: ", room.id, room)
                
                setRoom(room);
                setAudioInfo(room.audio)
            });

            const playbackSub = client.subscribe(`/user/queue/playback`, (message) => {
                const state: IPlaybackState = JSON.parse(message.body);

                console.log("Пришло обновление playback: ", state)

                playbackStateCallbackRef.current?.(state);
            });

            const audioSub = client.subscribe(`/user/queue/audio`, (message) => {
                const chunk: AudioChunk = {
                    bytes: message.binaryBody,
                    sequence: Number(message.headers["sequence"]),
                    duration: Number(message.headers["duration"]),
                    entryId: Number(message.headers["entry-id"]),
                    initialization: message.headers["initialization"] === "true"
                };

                onAudioChunkRef.current?.(chunk);
            });

            client.publish({ destination: `/app/user.ready` });

            //console.log("Вебсокет подписался на всё")

            return () => {
                audioSub.unsubscribe();
                playbackSub.unsubscribe();
                roomSub.unsubscribe();
            }
        });

        return unsubscribe;
    }, [addOnConnectHandler]);

    return {
        updateTrackPosition, 
        playNext, playPrev, 
        audioInfo,
        addToQueue, removeFromQueue,
        room, loadRoom,
        setAudioChunkHandler,
        setPlaybackStateCallback
    };
}