import { API_BASE } from "@/config";
import { IAudio, IPlaybackState, useListeningRoom } from "@/lib";
import React, { useEffect, useRef, useState } from "react";
import { PlaybackModeToggle } from "./PlaybackModeToggle";
import VolumeSlider from "./VolumeSlider";
import { audioService } from "@/lib/services/audio";
import { countPosition } from "@/lib/services/utils/interfaceFunctions";

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
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);

    const [paused, setPaused] = useState(true);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);

    const [audioInfo, setAudioInfo] = useState<IAudio | null>(null);

    useEffect(() => {
        async function loadAudioInfo(audioId: number) {
            const data = await audioService.loadAudioInfo(audioId);
            setAudioInfo(data);
        }

        if (playbackState.audioId) loadAudioInfo(playbackState.audioId);
    }, [playbackState.audioId])

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

    useEffect(() => {
        const writeUpdateMessage = (newState: IPlaybackState) => {

            console.log(newState)
            if (newState.audioId != currentAudioId) {
                setUpdateMessage(`${newState.user} включил трек #${newState.audioId}`);
            } else if (newState.pause != paused && newState.pause) {
                setUpdateMessage(`${newState.user} поставил на паузу`);
            } else if (newState.pause != paused && !newState.pause) {
                setUpdateMessage(`${newState.user} включил воспроизведение`);
            } else if (newState.position != position) {
                setUpdateMessage(`${newState.user} перемотал на ${countPosition(newState.position)}`);
            }
        }

        writeUpdateMessage(playbackState);
    }, [playbackState])

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

        audio.addEventListener("timeupdate", handleTimeUpdate);

        const handleLoadedMetadata = () => setDuration(audio.duration);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
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

        sendUserUpdate(position, nextPaused);
    };

    const debounceTimeoutRef = useRef<number | null>(null);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = Number(e.target.value);
        audio.pause();
        audio.currentTime = newTime;
        setPosition(newTime);

        // отменяем предыдущий таймаут, если был
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // ставим новый таймаут на 300 мс
        debounceTimeoutRef.current = setTimeout(() => {
            sendUserUpdate(newTime, paused);
            debounceTimeoutRef.current = null;
        }, 300);
    };

    const sendUserUpdate = (position: number, pausedState: boolean) => {
        const audio = audioRef.current;
        if (!audio) return;
        updateTrackPosition(playbackState.audioId, position, pausedState);
    };

    return (
        <div className="audio-tracker">

            {updateMessage && <div className="player-update">{updateMessage}</div>}

            <audio ref={audioRef} preload="metadata" />
            <div className="tracker-header">
                {audioInfo?.name}
            </div>
            <div className="tracker-main">
                <button onClick={togglePlay}>
                    {paused ? (
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    ) : (
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect x="5" y="3" width="5" height="18" />
                            <rect x="14" y="3" width="5" height="18" />
                        </svg>
                    )}
                </button>
                <input
                    type="range"
                    min={0}
                    max={duration}
                    value={position}
                    onChange={handleSeek}
                    style={{ width: "100%" }}
                />
                <div className="track-position">
                    <span>{countPosition(position)}</span>
                    <span>/</span>
                    <span>{countPosition(duration)}</span>
                </div>
            </div>
                    
            <div className="track-settings">
                <PlaybackModeToggle />
                <VolumeSlider audioRef={audioRef} />
            </div>
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