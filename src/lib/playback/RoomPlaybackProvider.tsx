import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IAudio, TimeRange } from "@audio";
import { useListeningRoomWS, useAudioStream, IShortRoom } from "@room";
import { countPosition } from "@common";
import { IPlaybackState } from "@playback";
import { PlaybackMode, Playlist } from "../playlist";
import { playbackService } from "./services";

interface RoomPlaybackContextType {
    room: IShortRoom | null;
    roomPlaylist: Playlist | null;
    playingAudio: IAudio | null;
    playbackMode: PlaybackMode;

    playbackState: IPlaybackState | null;
    roomLoaded: boolean;
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
        room, 
        roomPlaylist,
        playbackMode,
        
        setAudioChunkHandler,
        setPlaybackStateCallback,
    } = useListeningRoomWS();

    const { 
        handleAudioChunk, 
        pausePlayback, 
        audioRef, bufferedRanges,
        startNewAudio,

        playbackState, setPlaybackState,

        unsyncedStateRef
    } = useAudioStream();

    const playingAudio = useMemo<IAudio | null>(() => {
        const queueItem = roomPlaylist?.queue.find(qi => qi.id === playbackState?.entryId)

        if (!queueItem?.audio) return null;

        return queueItem.audio;
    }, [roomPlaylist, playbackState])

    const roomLoaded: boolean = !!room;

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
            setPlaybackState(prev => {

                if (prev?.entryId !== state.entryId) {
                    startNewAudio(state.entryId);
                }

                return state;
            });
            unsyncedStateRef.current = state;

            writeUpdateMessage(state);
        });

        return () => {
            setPlaybackStateCallback(() => {});
        };
    }, [
        setPlaybackStateCallback,
        startNewAudio,
        setPlaybackState
    ]);

    // Play / Pause кнопка
    const togglePlay = useCallback(async () => {

        if (!playbackState || !room?.id) return;

        const newPaused = !playbackState?.pause

        if (newPaused) {
            pausePlayback()
        }

        await playbackService.updateTrackPosition(room.id, {...playbackState, pause: newPaused});
    }, [playbackState, room?.id]);

    const seek = useCallback((position: number) => {

        if (!playbackState?.entryId || !room?.id) return;

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
            debounceTimeoutRef.current = setTimeout(async () => {
                if (playbackState) {
                    await playbackService.updateTrackPosition(room.id, newState);
                }
                debounceTimeoutRef.current = null;
            }, 100);
        }
    }, [playbackState, pausePlayback, room?.id]);

    useEffect(() => {
        setAudioChunkHandler((chunk) => {

            handleAudioChunk(chunk);
        });

        return () => {
            setAudioChunkHandler(() => {});
        };
    }, [setAudioChunkHandler]);

    useEffect(() => {
        if (!("mediaSession" in navigator) || !playbackState || !playingAudio || !room?.id) {
            return;
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: playingAudio.title || "",
            artist: playingAudio.artist || "",
            album: playingAudio.album || "",
            artwork: [
                {
                    src: "/images/face.webp",
                    sizes: "512x512",
                    type: "image/webp"
                }
            ]
        });

        navigator.mediaSession.setActionHandler("play", () => {
            togglePlay()
        });

        navigator.mediaSession.setActionHandler("pause", () => {
            togglePlay()
        });

        navigator.mediaSession.setActionHandler("nexttrack", async () => {
            await playbackService.playTrack(room?.id, "next");
        });

        navigator.mediaSession.setActionHandler("previoustrack", async () => {
            await playbackService.playTrack(room?.id, "prev");
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
            position: Math.min(playbackState?.position || 0, playingAudio.duration),
            duration: playingAudio.duration
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
        playingAudio,
        playbackState,
        room?.id,
        seek
    ]);
    
    return (
        <RoomPlaybackContext.Provider value={{ 
            room,
            roomPlaylist,
            playingAudio,
            playbackMode,

            playbackState, 
            roomLoaded, 
            fullPlayerOpen, 
            setFullPlayerOpen,
            updateMessage,
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