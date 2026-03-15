import { API_BASE } from "@/config";
import { IPlaybackState, useListeningRoom } from "@/lib";
import React, { useEffect, useRef, useState } from "react";
import { PlaybackModeToggle } from "./PlaybackModeToggle";

interface AudioTrackerProps {
    src: string;
    playbackState: IPlaybackState;
    updateTrackPosition: (audioId: number, position: number, pause: boolean) => void;
}

const AudioTracker: React.FC<AudioTrackerProps> = ({ src, playbackState, updateTrackPosition }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const lastTimeRef = useRef(0);
    const isProgrammaticRef = useRef(false);
    const hasUserInteractedRef = useRef(false);

    const [paused, setPaused] = useState(true);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);

    // Разрешаем play после первого клика
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

    // Обновление позиции и паузы от сервера
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        isProgrammaticRef.current = true;

        // Если трек сменился
        if (currentAudioId !== playbackState.audioId) {
            setCurrentAudioId(playbackState.audioId);
            audio.src = src;
            audio.load();
        }

        audio.currentTime = playbackState.position;
        setPosition(playbackState.position);

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
    }, [playbackState, src, currentAudioId]);

    // События пользователя
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const sendUpdate = (pause: boolean) => {
            if (isProgrammaticRef.current) return;

            const current = audio.currentTime;
            const diff = Math.abs(current - lastTimeRef.current);

            const positionChanged = diff > 1;
            const pauseChanged = pause !== paused;

            if (positionChanged || pauseChanged) {
                updateTrackPosition(playbackState.audioId, current, pause);
            }

            lastTimeRef.current = current;
            setPosition(current);
            setPaused(pause);
        };

        const handleTimeUpdate = () => sendUpdate(false);
        const handleSeeked = () => sendUpdate(false);

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("seeked", handleSeeked);

        const handleLoadedMetadata = () => setDuration(audio.duration);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("seeked", handleSeeked);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [playbackState, updateTrackPosition, paused]);

    // Play / Pause кнопка
    const togglePlay = () => {
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

        setPaused(nextPaused);
        sendUserUpdate(nextPaused);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = Number(e.target.value);
        audio.currentTime = newTime;
        setPosition(newTime);
        sendUserUpdate();
    };

    const sendUserUpdate = (pausedState?: boolean) => {
        const audio = audioRef.current;
        if (!audio) return;
        updateTrackPosition(playbackState.audioId, audio.currentTime, pausedState ?? paused);
    };

    return (
        <div style={{ width: 300, padding: 10, border: "1px solid #ccc" }}>
            <audio ref={audioRef} preload="metadata" />
            <button onClick={togglePlay}>{paused ? "Play" : "Pause"}</button>
            <div>
                <input
                    type="range"
                    min={0}
                    max={duration}
                    value={position}
                    onChange={handleSeek}
                    style={{ width: "100%" }}
                />
            </div>
            <div>
                {Math.floor(position)} / {Math.floor(duration)} sec
            </div>
            <PlaybackModeToggle />
        </div>
    );
};

export default function Audio() {
    const { playbackState, updateTrackPosition } = useListeningRoom();
    if (!playbackState) return null;

    return (
        <AudioTracker
            src={`${API_BASE}/audio/${playbackState.audioId}`}
            playbackState={playbackState}
            updateTrackPosition={updateTrackPosition}
        />
    );
}