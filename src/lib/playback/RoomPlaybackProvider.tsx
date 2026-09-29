import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IAudio, TimeRange } from "@audio";
import { IListeningRoom, useListeningRoomWS, useAudioStream, IShortRoom } from "@room";
import { countPosition } from "@common";
import { IPlaybackState, IQueueItemCreate } from "@playback";
import { PlaybackMode, Playlist } from "../playlist";
import { playbackService } from "./services";

interface RoomPlaybackContextType {
    room: IShortRoom | null;
    playlist: Playlist | null;
    audioInfo: IAudio | null;
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
        playlist,
        audioInfo,
        playbackMode,
        
        setAudioChunkHandler,
        setPlaybackStateCallback,
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
        if (!("mediaSession" in navigator) || !playbackState || !audioInfo || !room?.id) {
            return;
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: audioInfo.title || "",
            artist: audioInfo.artist || "",
            album: audioInfo.album || "",
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
            position: Math.min(playbackState?.position || 0, audioInfo.duration),
            duration: audioInfo.duration
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
        audioInfo,
        playbackState,
        room?.id,
        seek
    ]);
    
    return (
        <RoomPlaybackContext.Provider value={{ 
            room,
            playlist,
            audioInfo,
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