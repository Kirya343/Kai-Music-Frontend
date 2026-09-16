import { createContext, Dispatch, Ref, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IAudio, IListeningRoom, IPlaybackState, TimeRange } from "../types";
import { useListeningRoomWS } from "../hooks/useListeningRoomWS";
import { useGlobal } from "./GlobalContext";
import { useAudioStream } from "../services/audio/hooks";

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
    currentAudioId: number | null;
    setCurrentAudioId: Dispatch<SetStateAction<number | null>>;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    togglePlay: () => void;
    sendUserUpdate: (position: number, pausedState: boolean) => void;
    bufferedRanges: TimeRange[] | null;
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
    const { stopPlayback, handleAudioChunk, 
        resumePlayback, pausePlayback, 
        audioRef, bufferedRanges
    } = useAudioStream();
    const [localPosition, setLocalPosition] = useState<number>(0);
    const [roomLoaded, setRoomLoaded] = useState<boolean>(true);
    const duration = Number(audioInfo?.duration);
    const [paused, setPaused] = useState(true);
    const [fullPlayerOpen, setFullPlayerOpen] = useState<boolean>(false);
    const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);
    const isProgrammaticRef = useRef(false);
    const { started } = useGlobal();
    
    // Обновление позиции и паузы от сервера
    useEffect(() => {
        if (!playbackState) return;

        console.log(`Обновляем позицию: ${playbackState.entryId}, paused: ${playbackState.pause}, position: ${playbackState.position}`);

        isProgrammaticRef.current = true;

        //Если трек сменился
        if (currentAudioId !== playbackState.entryId) {
            setCurrentAudioId(playbackState?.entryId);
        }

        //audio.currentTime = playbackState.position;
        setLocalPosition(playbackState.position);

        if (playbackState.pause) {
            pausePlayback();
            console.log(`Ставим на паузу`);
            setPaused(true);
            
        } else {
            resumePlayback();
            setPaused(false);
        }

        const timeout = setTimeout(() => {
            isProgrammaticRef.current = false;
        }, 50);

        return () => clearTimeout(timeout);
    }, [playbackState, currentAudioId, started]);

    // События пользователя
    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        const handleTimeUpdate = () => setLocalPosition(audio.currentTime);
        audio.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [playbackState, updateTrackPosition, paused]);

    const sendUserUpdate = useCallback((position: number, pausedState: boolean) => {
        console.log(`Отправляем апдейт на position: ${position}, paused: ${pausedState}`);
        const audio = audioRef.current;

        if (!audio || !playbackState) return;
        updateTrackPosition(playbackState.entryId, position, pausedState);
    }, [playbackState]);

    // Play / Pause кнопка
    const togglePlay = useCallback(() => {
        const audio = audioRef.current;

        if (!audio) return;

        console.log("трек на паузе? ", paused)

        const nextPaused = !paused; // это то, что будет после клика

        if (nextPaused === false) {
            console.log("включаем трек");
            resumePlayback();
        } else {
            console.log("ставим на паузу");
            pausePlayback();
        }

        sendUserUpdate(localPosition, nextPaused);
    }, [localPosition, paused]);

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
            currentAudioId, setCurrentAudioId,
            paused, setPaused,
            loadRoom, audioInfo, 
            playNext, playPrev,
            audioRef, togglePlay,
            sendUserUpdate, bufferedRanges
        }}>
            {children}
        </ListeningRoomContext.Provider>
    );
};