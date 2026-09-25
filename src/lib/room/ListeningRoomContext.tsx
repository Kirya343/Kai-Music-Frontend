import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IAudio, TimeRange } from "@audio";
import { IListeningRoom, IPlaybackState, useListeningRoomWS, useAudioStream, IQueueItemCreate } from "@room";
import { countPosition } from "@common";

interface ListeningRoomContextType {
    playbackState: IPlaybackState | null;
    room: IListeningRoom | null;
    updateTrackPosition: (entryId: number, position: number, pause: boolean) => void;
    addToQueue: (list: IQueueItemCreate[]) => void;
    removeFromQueue: (list: number[]) => void;
    loadRoom: () => void;
    localPosition: number;
    setLocalPosition: Dispatch<SetStateAction<number>>;
    playNext: () => void;
    playPrev: () => void;
    roomLoaded: boolean;
    duration: number;
    paused: boolean;
    setPaused: Dispatch<SetStateAction<boolean>>;
    audioInfo: IAudio | null;
    fullPlayerOpen: boolean;
    setFullPlayerOpen: Dispatch<SetStateAction<boolean>>;
    updateMessage: string;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    togglePlay: () => void;
    sendUserUpdate: (position: number, pausedState: boolean) => void;
    bufferedRanges: Map<number, TimeRange[] | []>;
    pausePlayback: () => void;
    unsyncedStateRef: React.RefObject<IPlaybackState | null>;
    seek: (position: number) => void;
    currentEntryId: number | null;
}

const ListeningRoomContext = createContext<ListeningRoomContextType | null>(null);

export const useListeningRoom = () => {
    const ctx = useContext(ListeningRoomContext);
    if (!ctx) {
        throw new Error("useListeningRoom must be used inside AuthProvider");
    }
    return ctx;
}

export const ListeningRoomProvider = ({ children }: { children?: React.ReactNode }) => {

    const { 
        playbackState, updateTrackPosition, 
        playNext, playPrev, 
        audioInfo, room, 
        addToQueue, removeFromQueue, 
        loadRoom, setAudioChunkHandler,
        setPlaybackStateCallback
    } = useListeningRoomWS();

    const { 
        handleAudioChunk, 
        resumePlayback, pausePlayback, 
        audioRef, bufferedRanges,
        startNewPlaybackStream,

        currentEntryId, paused, localPosition,
        updateLocalPlayback, setPaused, setLocalPosition,

        unsyncedStateRef
    } = useAudioStream();

    const roomLoaded: boolean = !!room;
    const duration = Number(audioInfo?.duration);
    const prevRoomRef = useRef<number | null>(null);
    const debounceTimeoutRef = useRef<number | null>(null);

    // info
    const [updateMessage, setUpdateMessage] = useState<string>("");

    // ui
    const [fullPlayerOpen, setFullPlayerOpen] = useState<boolean>(false);
    
    const writeUpdateMessage = (newState: IPlaybackState) => {

        //console.log(newState)
        if (newState.entryId != currentEntryId) {
            setUpdateMessage(`${newState.user} started playing track #${newState.entryId}`);
        } else if (newState.pause != paused && newState.pause) {
            setUpdateMessage(`${newState.user} paused the playback`);
        } else if (newState.pause != paused && !newState.pause) {
            setUpdateMessage(`${newState.user} resumed playback`);
        } else if (newState.position != localPosition) {
            setUpdateMessage(`${newState.user} seeked to ${countPosition(newState.position)}`);
        }
    }

    useEffect(() => {
        if (!room) return;

        if (
            prevRoomRef.current !== null &&
            prevRoomRef.current !== room.id
        ) {
            pausePlayback();
        }

        prevRoomRef.current = room.id;
    }, [room?.id]);

    // Обновление позиции и паузы от сервера
    useEffect(() => {
        setPlaybackStateCallback((state: IPlaybackState) => {
            startNewPlaybackStream();
            updateLocalPlayback(state);
            unsyncedStateRef.current = state;

            writeUpdateMessage(state);
        });

        return () => {
            setPlaybackStateCallback(() => {});
        };
    }, [
        setPlaybackStateCallback,
        startNewPlaybackStream,
        updateLocalPlayback
    ]);

    useEffect(() => {
        const audio = audioRef.current;
        const state = unsyncedStateRef.current;

        if (!audio || !bufferedRanges || state === null || !currentEntryId) {
            return;
        }

        const ranges = bufferedRanges.get(currentEntryId)

        if (!ranges) return;

        const isBuffered = ranges.some(
            range =>
                state.position >= range.start &&
                state.position <= range.end
        );

        if (!isBuffered) {
            return;
        }

        audio.currentTime = state.position;
        unsyncedStateRef.current = null;

        if (!state.pause) {
            console.log("start playing")
            setPaused(false)
            resumePlayback();
        }
    }, [bufferedRanges, currentEntryId]);

    const sendUserUpdate = useCallback((position: number, pausedState: boolean) => {
        console.log(`Отправляем апдейт на position: ${position}, paused: ${pausedState}, entryId: ${playbackState?.entryId}`);
        if (!playbackState) return;

        updateTrackPosition(playbackState.entryId, position, pausedState);
    }, [playbackState]);

    // Play / Pause кнопка
    const togglePlay = useCallback(() => {

        const newPaused = !paused

        if (newPaused) {
            pausePlayback()
        }

        sendUserUpdate(localPosition, newPaused);
    }, [localPosition, paused, sendUserUpdate]);

    const seek = useCallback((position: number) => {

        if (!playbackState?.entryId) return;

        try {
            pausePlayback();
        } finally {
            unsyncedStateRef.current = {pause: paused, position: position, entryId: playbackState?.entryId}
            setLocalPosition(position);

            // отменяем предыдущий таймаут, если был
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // ставим новый таймаут на 300 мс
            debounceTimeoutRef.current = setTimeout(() => {
                if (playbackState) {
                    updateTrackPosition(
                        playbackState.entryId,
                        position,
                        paused
                    );
                }
                debounceTimeoutRef.current = null;
            }, 100);
        }
    }, [playbackState, updateTrackPosition, pausePlayback, paused]);

    useEffect(() => {
        setAudioChunkHandler((chunk) => {

            handleAudioChunk(chunk);
        });

        return () => {
            setAudioChunkHandler(() => {});
        };
    }, [setAudioChunkHandler]);

    useEffect(() => {
        if (!("mediaSession" in navigator) || !room || !localPosition || !room?.audio) {
            return;
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: room?.audio.title || "",
            artist: room?.audio.artist || "",
            album: room?.audio.album || "",
            artwork: [
                {
                    src: "/images/face.webp",
                    sizes: "512x512",
                    type: "image/webp"
                }
            ]
        });

        navigator.mediaSession.setActionHandler("play", () => {
            sendUserUpdate(localPosition, false);
        });

        navigator.mediaSession.setActionHandler("pause", () => {
            sendUserUpdate(localPosition, true);
        });

        navigator.mediaSession.setActionHandler("nexttrack", () => {
            playNext();
        });

        navigator.mediaSession.setActionHandler("previoustrack", () => {
            playPrev();
        });

        navigator.mediaSession.setActionHandler("seekbackward", () => {
            seek(Math.max(0, localPosition - 10));
        });

        navigator.mediaSession.setActionHandler("seekforward", () => {
            seek(localPosition + 10);
        });

        navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (details.seekTime != null) {
                seek(details.seekTime);
            }
        });

        navigator.mediaSession.setPositionState({
            playbackRate: 1,
            position: Math.min(localPosition, room?.audio.duration),
            duration: room?.audio.duration
        })

        return () => {
            navigator.mediaSession.setActionHandler("play", null);
            navigator.mediaSession.setActionHandler("pause", null);
            navigator.mediaSession.setActionHandler("nexttrack", null);
            navigator.mediaSession.setActionHandler("previoustrack", null);
            navigator.mediaSession.setActionHandler("seekbackward", null);
            navigator.mediaSession.setActionHandler("seekforward", null);
            navigator.mediaSession.setActionHandler("seekto", null);
        };
    }, [
        room,
        localPosition,
        sendUserUpdate,
        playNext,
        playPrev,
        seek
    ]);
    
    return (
        <ListeningRoomContext.Provider value={{ 
            playbackState, room, 
            updateTrackPosition, 
            addToQueue, removeFromQueue, 
            localPosition, setLocalPosition,
            roomLoaded,
            duration, 
            fullPlayerOpen, setFullPlayerOpen,
            updateMessage,
            paused, setPaused,
            loadRoom, audioInfo,
            playNext, playPrev,
            audioRef, togglePlay,
            sendUserUpdate, bufferedRanges,
            pausePlayback, unsyncedStateRef,
            seek, currentEntryId
        }}>
            {children}
        </ListeningRoomContext.Provider>
    );
};