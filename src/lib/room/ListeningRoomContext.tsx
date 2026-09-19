import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IAudio, TimeRange } from "@audio";
import { IListeningRoom, IPlaybackState, useListeningRoomWS, useAudioStream } from "@room";
import { countPosition } from "@common";

interface ListeningRoomContextType {
    playbackState: IPlaybackState | null;
    room: IListeningRoom | null;
    updateTrackPosition: (entryId: number, position: number, pause: boolean) => void;
    addToQueue: (entryId: number) => void;
    removeFromQueue: (entryId: number) => void;
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
    seek: (pos: number) => void
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
            loadRoom, setAudioChunkHandler 
    } = useListeningRoomWS();
    const { handleAudioChunk, 
        resumePlayback, pausePlayback, 
        audioRef, bufferedRanges,
        startNewPlaybackStream
    } = useAudioStream();

    const [localPosition, setLocalPosition] = useState<number>(0);
    const [roomLoaded, setRoomLoaded] = useState<boolean>(true);
    const duration = Number(audioInfo?.duration);
    const [paused, setPaused] = useState(true);
    const [fullPlayerOpen, setFullPlayerOpen] = useState<boolean>(false);
    const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);
    const [updateMessage, setUpdateMessage] = useState<string>("");
    const syncedPositionRef = useRef<number | null>(null);
    const pendingSeekPositionRef = useRef<number | null>(null);
    
    const writeUpdateMessage = (newState: IPlaybackState) => {

        //console.log(newState)
        if (newState.entryId != currentAudioId) {
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
        const audio = audioRef.current;
        
        if (!playbackState || !audio) return;

        startNewPlaybackStream();
        setCurrentAudioId(playbackState.entryId);

        console.log("устанавливаем setLocalPosition на playbackState.position")
        setLocalPosition(playbackState.position);

        if (playbackState.pause) {
            pausePlayback();
            setPaused(true);
        } else {
            resumePlayback();
            setPaused(false);
        }

        writeUpdateMessage(playbackState)
    }, [playbackState]);

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio || !bufferedRanges || !playbackState) {
            return;
        }

        const pendingSeek = pendingSeekPositionRef.current;

        if (pendingSeek !== null) {
            const isBuffered = bufferedRanges.some(
                range =>
                    pendingSeek >= range.start &&
                    pendingSeek <= range.end
            );

            if (!isBuffered) {
                return;
            }

            console.log("Seek position buffered:", pendingSeek);

            audio.currentTime = pendingSeek;

            pendingSeekPositionRef.current = null;

            if (!playbackState.pause) {
                audio.play();
            }

            return;
        }

        const position = playbackState.position;

        if (syncedPositionRef.current === position) {
            return;
        }

        const isBuffered = bufferedRanges.some(
            range =>
                position >= range.start &&
                position <= range.end
        );

        if (!isBuffered) {
            return;
        }

        audio.currentTime = position;
        syncedPositionRef.current = position;

        if (!playbackState.pause) {
            audio.play();
        }
    }, [bufferedRanges, playbackState]);

    // События пользователя
    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        const handleTimeUpdate = () => {
            if (pendingSeekPositionRef.current) return;
            setLocalPosition(audio.currentTime);
        }
        audio.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [playbackState, updateTrackPosition, paused]);

    const sendUserUpdate = useCallback((position: number, pausedState: boolean) => {
        console.log(`Отправляем апдейт на position: ${position}, paused: ${pausedState}, entryId: ${playbackState?.entryId}`);
        if (!playbackState) return;

        updateTrackPosition(playbackState.entryId, position, pausedState);
    }, [playbackState]);

    // Play / Pause кнопка
    const togglePlay = useCallback(() => {

        sendUserUpdate(localPosition, !paused);
    }, [localPosition, paused, sendUserUpdate]);

    const seek = useCallback((position: number) => {
        pendingSeekPositionRef.current = position;

        setLocalPosition(position);

        pausePlayback();

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
            pausePlayback, seek
        }}>
            {children}
        </ListeningRoomContext.Provider>
    );
};