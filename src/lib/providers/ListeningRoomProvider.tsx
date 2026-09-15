import { useCallback, useEffect, useRef, useState } from "react";
import { ListeningRoomContext } from "../contexts";
import { useListeningRoomWS } from "../hooks/useListeningRoomWS";
import { API_BASE } from "@/config";
import { useGlobal } from "../contexts/GlobalContext";

export const ListeningRoomProvider = ({ children }: { children?: React.ReactNode }) => {

    const { playbackState, updateTrackPosition, 
            playNext, playPrev, 
            audioInfo, room, 
            addToQueue, removeFromQueue, 
            loadRoom, setAudioChunkHandler } = useListeningRoomWS();
    const [localPosition, setLocalPosition] = useState<number>(0);
    const [roomLoaded, setRoomLoaded] = useState<boolean>(true);
    const [duration, setDuration] = useState(0);
    const [paused, setPaused] = useState(true);
    const [fullPlayerOpen, setFullPlayerOpen] = useState<boolean>(false);
    const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isProgrammaticRef = useRef(false);
    const { started } = useGlobal();

    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const queueRef = useRef<Uint8Array[]>([]);

    useEffect(() => {
        initAudioStream();
    }, []);
    
    // Обновление позиции и паузы от сервера
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !playbackState) return;

        console.log(`Обновляем позицию: ${playbackState.entryId}, paused: ${playbackState.pause}, position: ${playbackState.position}`);

        isProgrammaticRef.current = true;

        //Если трек сменился
        if (currentAudioId !== playbackState.entryId) {
            setCurrentAudioId(playbackState?.entryId);
        }

        audio.currentTime = playbackState.position;
        setLocalPosition(playbackState.position);

        if (playbackState.pause) {
            audio.pause();
            console.log(`Ставим на паузу`);
            setPaused(true);
            
        } else {
            audio.play().catch(console.warn);
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

        const handleLoadedMetadata = () => setDuration(audio.duration);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
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
            audio.play().catch(console.warn);
        } else {
            console.log("ставим на паузу");
            audio.pause();
        }

        sendUserUpdate(localPosition, nextPaused);
    }, [localPosition, paused]);

    useEffect(() => {
        setAudioChunkHandler((chunk) => {
            queueRef.current.push(chunk.bytes);

            appendNextChunk();
        });

        return () => {
            setAudioChunkHandler(() => {});
        };
    }, [setAudioChunkHandler]);

    const initAudioStream = () => {
        const audio = audioRef.current;
        if (!audio) return;

        const mediaSource = new MediaSource();

        mediaSourceRef.current = mediaSource;

        audio.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener("sourceopen", () => {
            const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");

            sourceBufferRef.current = sourceBuffer;

            sourceBuffer.addEventListener("updateend", appendNextChunk);

            appendNextChunk();
        }, { once: true });
    };

    const appendNextChunk = () => {
        const sourceBuffer = sourceBufferRef.current;

        if (!sourceBuffer) return;
        if (sourceBuffer.updating) return;

        const chunk = queueRef.current.shift();

        if (!chunk) return;

        const buffer = new ArrayBuffer(chunk.byteLength);
        new Uint8Array(buffer).set(chunk);

        sourceBuffer.appendBuffer(buffer);
    };

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