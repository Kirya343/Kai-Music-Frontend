import { API_BASE } from "@/config";
import { IAudio, IPlaybackState, useListeningRoom } from "@/lib";
import { useEffect, useRef, useState } from "react";

const Audio = () => {
    const { playbackState, updateTrackPosition } = useListeningRoom();
    const audioRef = useRef<HTMLAudioElement>(null);
    const lastTimeRef = useRef(0);
    const isProgrammaticRef = useRef(false);
    const hasUserInteractedRef = useRef(false);
    const [currentPlaybackState, setCurrentPlaybackState] = useState<IPlaybackState | null>(null)

    // Отслеживаем первый клик пользователя для разрешения play()
    useEffect(() => {
        const handleInteraction = () => {
            hasUserInteractedRef.current = true;
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("keydown", handleInteraction);
        };
        window.addEventListener("click", handleInteraction);
        window.addEventListener("keydown", handleInteraction);
        return () => {
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("keydown", handleInteraction);
        };
    }, []);

    // Обновление позиции / состояния при серверном playbackState
    useEffect(() => {
        if (!audioRef.current || !playbackState) return;
        console.log("Пришло обновление трека:", playbackState)
        const audio = audioRef.current;

        isProgrammaticRef.current = true;
        audio.currentTime = playbackState.position;

        if (currentPlaybackState?.audioId != playbackState.audioId) {
            audio.load()
        }

        // Не вызываем play() без клика пользователя
        if (playbackState.pause) {
            audio.pause();
        } else if (hasUserInteractedRef.current) {
            audio.play().catch(e => console.warn("Не удалось воспроизвести:", e));
        }

        setCurrentPlaybackState(playbackState);

        const timeout = setTimeout(() => {
            isProgrammaticRef.current = false;
        }, 50);

        return () => clearTimeout(timeout);
    }, [currentPlaybackState, playbackState]);

    // Отслеживание действий пользователя
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !playbackState) return;

        const handleUpdate = (pause: boolean) => {
            if (!playbackState) return;
            if (isProgrammaticRef.current) return; // игнорируем серверные обновления

            const current = audio.currentTime;
            const diff = Math.abs(current - lastTimeRef.current);

            const newState = {
                audioId: playbackState.audioId,
                position: current,
                pause
            };

            // Любая заметная перемотка или пауза/плей
            const positionChanged = diff > 1;
            const pauseChanged = pause !== playbackState.pause;

            if (positionChanged || pauseChanged) {
                console.log("Отправляем обновление от пользователя:", newState);
                updateTrackPosition(newState.audioId, newState.position, newState.pause);
            }

            lastTimeRef.current = current;
        };

        const handleTimeUpdate = () => handleUpdate(false);
        const handlePlay = () => handleUpdate(false);
        const handlePause = () => handleUpdate(true);
        const handleSeeked = () => handleUpdate(false); // перемотка пользователем

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("seeked", handleSeeked);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("seeked", handleSeeked);
        };
    }, [playbackState, updateTrackPosition]);

    if (!playbackState) return null;

    return (
        <div className="audio">
            <span>{audio.name}</span>
            <audio ref={audioRef} controls>
                <source src={`${API_BASE}/audio/${playbackState.audioId}`} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};

export default Audio;