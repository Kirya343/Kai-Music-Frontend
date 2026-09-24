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
    setRoomLoaded: Dispatch<SetStateAction<boolean>>;
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
    bufferedRanges: TimeRange[] | null;
    pausePlayback: () => void;
    unsyncedStateRef: React.RefObject<IPlaybackState | null>;
    seek: (position: number) => void
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

    const { playbackState, updateTrackPosition, 
            playNext, playPrev, 
            audioInfo, room, 
            addToQueue, removeFromQueue, 
            loadRoom, setAudioChunkHandler,
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

    const [roomLoaded, setRoomLoaded] = useState<boolean>(true);
    const duration = Number(audioInfo?.duration);

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
    
    // Обновление позиции и паузы от сервера
    useEffect(() => {
        if (!playbackState) return;

        startNewPlaybackStream();
        updateLocalPlayback(playbackState);

        unsyncedStateRef.current = playbackState;

        writeUpdateMessage(playbackState)
    }, [playbackState]);

    useEffect(() => {
        const audio = audioRef.current;
        const state = unsyncedStateRef.current;

        if (!audio || !bufferedRanges || !playbackState || state === null) {
            return;
        }

        if (state.entryId !== currentEntryId) {
            return;
        }

        const isBuffered = bufferedRanges.some(
            range =>
                state.position >= range.start &&
                state.position <= range.end
        );

        if (!isBuffered) {
            return;
        }

        audio.currentTime = state.position;
        unsyncedStateRef.current = null;

        if (!playbackState.pause) {
            console.log("start playing")
            setPaused(false)
            resumePlayback();
        }
    }, [bufferedRanges, playbackState, currentEntryId]);

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

        console.log("paused", paused, "position", position)
        if (playbackState) {
            updateTrackPosition(
                playbackState.entryId,
                position,
                paused
            );
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
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: room?.audio.title,
                artist: room?.audio.artist,
                album: room?.audio.album,
                artwork: [
                    {
                        src: "/images/face.webp",
                        sizes: "512x512",
                        type: "image/webp",
                    },
                ],
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
        }
    }, [])
    
    return (
        <ListeningRoomContext.Provider value={{ 
            playbackState, room, 
            updateTrackPosition, 
            addToQueue, removeFromQueue, 
            localPosition, setLocalPosition,
            roomLoaded, setRoomLoaded,
            duration, 
            fullPlayerOpen, setFullPlayerOpen,
            updateMessage,
            paused, setPaused,
            loadRoom, audioInfo,
            playNext, playPrev,
            audioRef, togglePlay,
            sendUserUpdate, bufferedRanges,
            pausePlayback, unsyncedStateRef,
            seek
        }}>
            {children}
        </ListeningRoomContext.Provider>
    );
};