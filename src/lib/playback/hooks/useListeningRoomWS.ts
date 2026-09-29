import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "@websocket";
import { AudioChunk, IAudio } from "@audio";
import { IListeningRoom, IShortRoom } from "@room";
import { IPlaybackState } from "@playback";
import { PlaybackMode, Playlist } from "@/lib/playlist";

export const useListeningRoomWS = () => {
    
    const { addOnConnectHandler } = useWebSocket();

    const [room, setRoom] = useState<IShortRoom | null>(null);
    const [audioInfo, setAudioInfo] = useState<IAudio | null>(null);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(PlaybackMode.NORMAL);

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

    useEffect(() => {
        const unsubscribe = addOnConnectHandler((client) => {

            const roomSub = client.subscribe(`/user/queue/room`, (message) => {
                const room: IListeningRoom = JSON.parse(message.body);
                
                setRoom(room);
            });

            const playbackModeSub = client.subscribe(`/user/queue/playback-mode`, (message) => {
                setPlaybackMode(JSON.parse(message.body));
            });

            const playlistSub = client.subscribe(`/user/queue/playlist`, (message) => {
                setPlaylist(JSON.parse(message.body));
            });

            const audioInfoSub = client.subscribe(`/user/queue/audio-info`, (message) => {
                setAudioInfo(JSON.parse(message.body));
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
                playbackModeSub.unsubscribe();
                playlistSub.unsubscribe();
                audioInfoSub.unsubscribe();
            }
        });

        return unsubscribe;
    }, [addOnConnectHandler]);

    return {
        room,
        playlist,
        audioInfo,
        playbackMode,

        setAudioChunkHandler,
        setPlaybackStateCallback,
    };
}