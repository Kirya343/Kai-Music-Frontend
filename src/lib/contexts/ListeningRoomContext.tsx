import { createContext, Dispatch, Ref, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IAudio, IListeningRoom, IPlaybackState, TimeRange } from "../types";
import { useListeningRoomWS } from "../services/audio/hooks/useListeningRoomWS";
import { useGlobal } from "./GlobalContext";
import { useAudioStream } from "../services/audio/hooks/useAudioStream";
import { countPosition } from "../services/utils/interfaceFunctions";

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
    const { cleanupAudio, handleAudioChunk, 
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
    const isProgrammaticRef = useRef(false);
    const { started } = useGlobal();
    const [updateMessage, setUpdateMessage] = useState<string>("");
    const syncedPositionRef = useRef<number | null>(null);
    
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

        if (
            currentAudioId !== null &&
            currentAudioId !== playbackState.entryId
        ) {
            cleanupAudio();
        }

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
        if (!audioRef.current || !bufferedRanges || !playbackState) {
            return;
        }

        const position = playbackState.position;

        if (syncedPositionRef.current === position) {
            return;
        }

        const isBuffered = bufferedRanges.some(
            range => position >= range.start && position <= range.end
        );

        if (!isBuffered) {
            return;
        }

        console.log("playbackState seek:", position)
        audioRef.current.currentTime = position;
        syncedPositionRef.current = position;

        if (!playbackState.pause) {
            audioRef.current.play();
        }
    }, [bufferedRanges, playbackState]);

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

    useEffect(() => {console.log("playbackState", playbackState)}, [playbackState])

    const sendUserUpdate = useCallback((position: number, pausedState: boolean) => {
        console.log(`Отправляем апдейт на position: ${position}, paused: ${pausedState}, entryId: ${playbackState?.entryId}`);
        if (!playbackState) return;

        updateTrackPosition(playbackState.entryId, position, pausedState);
    }, [playbackState]);

    // Play / Pause кнопка
    const togglePlay = useCallback(() => {
        console.log("трек на паузе? ", paused)

        const nextPaused = !paused; // это то, что будет после клика

        /* try {
            if (nextPaused === false) {
                console.log("включаем трек");
                resumePlayback();
            } else {
                console.log("ставим на паузу");
                pausePlayback();
            }
        } catch (e) {
            console.error('Ошибка переключения состояния', e)
        } */

        sendUserUpdate(localPosition, nextPaused);
    }, [localPosition, paused, sendUserUpdate]);

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
            sendUserUpdate, bufferedRanges
        }}>
            {children}
        </ListeningRoomContext.Provider>
    );
};