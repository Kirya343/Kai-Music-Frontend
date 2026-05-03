import { useCallback, useEffect, useRef, useState } from "react";
import { ListeningRoomContext } from "../contexts";
import { useListeningRoomWS } from "../hooks/useListeningRoomWS";
import { audioService } from "../services/audio";
import { API_BASE } from "@/config";

export const ListeningRoomProvider = ({ children }: { children?: React.ReactNode }) => {

    const { room, addToQueue, removeFromQueue, loadRoom } = audioService.useCurrentRoom();
    const { playbackState, updateTrackPosition, playNext, playPrev, audioInfo} = useListeningRoomWS(room?.id || null);
    const [localPosition, setLocalPosition] = useState<number>(0);
    const [roomLoaded, setRoomLoaded] = useState<boolean>(false);
    const [duration, setDuration] = useState(0);
    const [paused, setPaused] = useState(true);
    const [fullPlayerOpen, setFullPlayerOpen] = useState<boolean>(false);
    const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isProgrammaticRef = useRef(false);
    const hasUserInteractedRef = useRef(false);

    // Обновление позиции и паузы от сервера
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !playbackState) return;

        isProgrammaticRef.current = true;

        // Если трек сменился
        if (currentAudioId !== playbackState.entryId) {
            setCurrentAudioId(playbackState?.entryId);
            audio.src = `${API_BASE}/audio/${playbackState.entryId}`;
            audio.load();
        }

        audio.currentTime = playbackState.position;
        setLocalPosition(playbackState.position);

        if (playbackState.pause) {
            audio.pause();
            setPaused(true);
        } else if (hasUserInteractedRef.current) {
            audio.play().catch(console.warn);
            setPaused(false);
        }

        const timeout = setTimeout(() => {
            isProgrammaticRef.current = false;
        }, 50);

        return () => clearTimeout(timeout);
    }, [playbackState, currentAudioId]);

    // События пользователя
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setLocalPosition(audio.currentTime);
        audio.addEventListener("timeupdate", handleTimeUpdate);

        const handleLoadedMetadata = () => setDuration(audio.duration);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [playbackState, updateTrackPosition, paused]);

    const sendUserUpdate = (position: number, pausedState: boolean) => {
        const audio = audioRef.current;
        if (!audio || !playbackState) return;
        updateTrackPosition(playbackState.entryId, position, pausedState);
    };

    // Play / Pause кнопка
    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const nextPaused = !paused; // это то, что будет после клика

        if (nextPaused === false) {
            console.log("включаем трек");
            audio.play().catch(console.warn);
        } else {
            console.log("ставим на паузу");
            audio.pause();
        }

        sendUserUpdate(localPosition, nextPaused);
    }, [paused]);

    return (
        <ListeningRoomContext.Provider value={{ 
            playbackState, 
            room, 
            updateTrackPosition, 
            addToQueue, 
            removeFromQueue, 
            loadRoom,
            localPosition,
            setLocalPosition,
            playNext, 
            playPrev,
            roomLoaded,
            setRoomLoaded,
            duration,
            setDuration,
            paused, 
            setPaused,
            audioInfo,
            fullPlayerOpen, 
            setFullPlayerOpen,
            currentAudioId, 
            setCurrentAudioId,
            audioRef,
            togglePlay,
            sendUserUpdate
        }}>
            <audio ref={audioRef} preload="metadata" />
            {children}
        </ListeningRoomContext.Provider>
    );
};