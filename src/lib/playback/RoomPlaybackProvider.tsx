import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IAudio, TimeRange } from "@audio";
import { IListeningRoom, useListeningRoomWS, useAudioStream } from "@room";
import { countPosition } from "@common";
import { IPlaybackState, IQueueItemCreate } from "@playback";

interface RoomPlaybackContextType {
    playbackState: IPlaybackState | null;
    room: IListeningRoom | null;
    updateTrackPosition: (state: IPlaybackState) => void;
    addToQueue: (list: IQueueItemCreate[]) => void;
    removeFromQueue: (list: number[]) => void;
    loadRoom: () => void;
    playNext: () => void;
    playPrev: () => void;
    roomLoaded: boolean;
    duration: number;
    audioInfo: IAudio | null;
    fullPlayerOpen: boolean;
    setFullPlayerOpen: Dispatch<SetStateAction<boolean>>;
    updateMessage: string;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    togglePlay: () => void;
    bufferedRanges: Map<number, TimeRange[] | []>;
    pausePlayback: () => void;
    unsyncedStateRef: React.RefObject<IPlaybackState | null>;
    seek: (position: number) => void;
}

const RoomPlaybackContext = createContext<RoomPlaybackContextType | null>(null);

export const useRoomPlayback = () => {
    const ctx = useContext(RoomPlaybackContext);
    if (!ctx) {
        throw new Error("useRoomPlayback must be used inside AuthProvider");
    }
    return ctx;
}

export const RoomPlaybackProvider = ({ children }: { children?: React.ReactNode }) => {

    const { 
        updateTrackPosition, 
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

        playbackState, setPlaybackState,

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
    
    const writeUpdateMessage = useCallback((newState: IPlaybackState) => {

        //console.log(newState)
        if (newState.entryId != playbackState?.entryId) {
            setUpdateMessage(`${newState.user} started playing track #${newState.entryId}`);
        } else if (newState.pause != playbackState?.pause && newState.pause) {
            setUpdateMessage(`${newState.user} paused the playback`);
        } else if (newState.pause != playbackState?.pause && !newState.pause) {
            setUpdateMessage(`${newState.user} resumed playback`);
        } else if (newState.position != playbackState?.position) {
            setUpdateMessage(`${newState.user} seeked to ${countPosition(newState.position)}`);
        }
    }, [playbackState])

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
            setPlaybackState(state);
            unsyncedStateRef.current = state;

            writeUpdateMessage(state);
        });

        return () => {
            setPlaybackStateCallback(() => {});
        };
    }, [
        setPlaybackStateCallback,
        startNewPlaybackStream,
        setPlaybackState
    ]);

    useEffect(() => {
        const audio = audioRef.current;
        const state = unsyncedStateRef.current;

        if (!audio || !bufferedRanges || state === null || !playbackState?.entryId) {
            return;
        }

        const ranges = bufferedRanges.get(playbackState?.entryId)

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
            setPlaybackState(prev => ({...prev!, pause: false}))
            resumePlayback();
        }
    }, [bufferedRanges, playbackState?.entryId]);

    // Play / Pause кнопка
    const togglePlay = useCallback(() => {

        if (!playbackState) return;

        const newPaused = !playbackState?.pause

        if (newPaused) {
            pausePlayback()
        }

        updateTrackPosition({...playbackState, pause: newPaused});
    }, [playbackState, updateTrackPosition]);

    const seek = useCallback((position: number) => {

        if (!playbackState?.entryId) return;

        try {
            pausePlayback();
        } finally {

            const newState = ({...playbackState, position})
            unsyncedStateRef.current = newState
            setPlaybackState(newState)

            // отменяем предыдущий таймаут, если был
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // ставим новый таймаут на 300 мс
            debounceTimeoutRef.current = setTimeout(() => {
                if (playbackState) {
                    updateTrackPosition(newState);
                }
                debounceTimeoutRef.current = null;
            }, 100);
        }
    }, [playbackState, updateTrackPosition, pausePlayback]);

    useEffect(() => {
        setAudioChunkHandler((chunk) => {

            handleAudioChunk(chunk);
        });

        return () => {
            setAudioChunkHandler(() => {});
        };
    }, [setAudioChunkHandler]);

    useEffect(() => {
        if (!("mediaSession" in navigator) || !room || !playbackState || !room?.audio) {
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
            const state: IPlaybackState = {...playbackState, pause: false};
            updateTrackPosition(state)
        });

        navigator.mediaSession.setActionHandler("pause", () => {
            const state: IPlaybackState = {...playbackState, pause: true};
            updateTrackPosition(state)
        });

        navigator.mediaSession.setActionHandler("nexttrack", () => {
            playNext();
        });

        navigator.mediaSession.setActionHandler("previoustrack", () => {
            playPrev();
        });

        navigator.mediaSession.setActionHandler("seekbackward", () => {
            seek(Math.max(0, playbackState?.position || 0 - 10));
        });

        navigator.mediaSession.setActionHandler("seekforward", () => {
            seek(playbackState?.position || 0 + 10);
        });

        navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (details.seekTime != null) {
                seek(details.seekTime);
            }
        });

        navigator.mediaSession.setPositionState({
            playbackRate: 1,
            position: Math.min(playbackState?.position || 0, room?.audio.duration),
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
        playbackState,
        updateTrackPosition,
        playNext,
        playPrev,
        seek
    ]);
    
    return (
        <RoomPlaybackContext.Provider value={{ 
            playbackState, 
            room, 
            updateTrackPosition, 
            addToQueue, 
            removeFromQueue, 
            loadRoom,
            playNext, 
            playPrev,
            roomLoaded,
            duration, 
            fullPlayerOpen, 
            setFullPlayerOpen,
            updateMessage,
            audioInfo,
            audioRef, 
            togglePlay,
            bufferedRanges,
            pausePlayback, 
            unsyncedStateRef,
            seek
        }}>
            {children}
        </RoomPlaybackContext.Provider>
    );
};