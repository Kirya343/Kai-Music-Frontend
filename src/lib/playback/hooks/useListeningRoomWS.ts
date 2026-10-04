import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "@websocket";
import { AudioChunk, IAudio } from "@audio";
import { IListeningRoom } from "@room";
import { IPlaybackState } from "@playback";
import { PlaybackMode, Playlist } from "@/lib/playlist";
import { useData } from "@common";

export const useListeningRoomWS = () => {
    
    const { addOnConnectHandler } = useWebSocket();

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

            const playbackModeSub = client.subscribe(`/user/queue/playback-mode`, (message) => {
                setPlaybackMode(JSON.parse(message.body));
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

            return () => {
                audioSub.unsubscribe();
                playbackSub.unsubscribe();
                playbackModeSub.unsubscribe();
            }
        });

        return unsubscribe;
    }, [addOnConnectHandler]);

    return {
        playbackMode,

        setAudioChunkHandler,
        setPlaybackStateCallback,
    };
}