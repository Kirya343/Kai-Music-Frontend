import { API_BASE } from "@/config";
import { IAudio, IPlaybackState, useListeningRoom } from "@/lib";
import React, { useEffect, useRef, useState } from "react";
import { PlaybackModeToggle } from "./PlaybackModeToggle";
import VolumeSlider from "./VolumeSlider";
import { audioService } from "@/lib/services/audio";
import { countPosition } from "@/lib/services/utils/interfaceFunctions";
import PauseIcon from "@/components/icons/PauseIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import LeftIcon from "@/components/icons/LeftIcon";
import RightIcon from "@/components/icons/RightIcon";

interface AudioTrackerProps {
    src: string;
    playbackState: IPlaybackState;
    updateTrackPosition: (entryId: number, position: number, pause: boolean) => void;
}

const AudioTracker: React.FC<AudioTrackerProps> = ({ src, playbackState, updateTrackPosition }) => {
    const { localPosition, setLocalPosition } = useListeningRoom();

    const audioRef = useRef<HTMLAudioElement>(null);
    const lastTimeRef = useRef(0);
    const isProgrammaticRef = useRef(false);
    const hasUserInteractedRef = useRef(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);

    const [duration, setDuration] = useState(0);

    const [paused, setPaused] = useState(true);
    const [currentAudioId, setCurrentAudioId] = useState<number | null>(null);

    const [audioInfo, setAudioInfo] = useState<IAudio | null>(null);

    useEffect(() => {
        async function loadAudioInfo(entryId: number) {
            const data = await audioService.loadAudioInfo(entryId);
            setAudioInfo(data);
        }

        if (playbackState.entryId) loadAudioInfo(playbackState.entryId);
    }, [playbackState.entryId])

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
        if (currentAudioId !== playbackState.entryId) {
            setCurrentAudioId(playbackState.entryId);
            audio.src = src;
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
    }, [playbackState, src, currentAudioId]);

    useEffect(() => {
        const writeUpdateMessage = (newState: IPlaybackState) => {

            console.log(newState)
            if (newState.entryId != currentAudioId) {
                setUpdateMessage(`${newState.user} включил трек #${newState.entryId}`);
            } else if (newState.pause != paused && newState.pause) {
                setUpdateMessage(`${newState.user} поставил на паузу`);
            } else if (newState.pause != paused && !newState.pause) {
                setUpdateMessage(`${newState.user} включил воспроизведение`);
            } else if (newState.position != localPosition) {
                setUpdateMessage(`${newState.user} перемотал на ${countPosition(newState.position)}`);
            }
        }

        writeUpdateMessage(playbackState);
    }, [playbackState])

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

        sendUserUpdate(localPosition, nextPaused);
    };

    const debounceTimeoutRef = useRef<number | null>(null);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = Number(e.target.value);
        audio.pause();
        audio.currentTime = newTime;
        setLocalPosition(newTime);

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
        updateTrackPosition(playbackState.entryId, position, pausedState);
    };

    useEffect(() => {
        console.log("paused: ", paused)
    }, [paused])

    const headerRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const header = headerRef.current;
        const text = textRef.current;

        if (!header || !text) return;

        if (text.scrollWidth > header.clientWidth) {
            text.classList.add("animate");
        } else {
            text.classList.remove("animate");
        }
    }, [audioInfo]);

    return (
        <div className="audio-tracker">

            {updateMessage && <div className="player-update" onDoubleClick={() => setUpdateMessage("")}>{updateMessage}</div>}

            <audio ref={audioRef} preload="metadata" />
            
            <div ref={headerRef} className="tracker-header">
                <div ref={textRef} className="tracker-header-text">
                    {audioInfo?.name}
                </div>
            </div>

            <div className="tracker-main">
                <div className="navigation">
                    <button>
                        <LeftIcon />
                    </button>
                    <button onClick={togglePlay}>
                        {paused ? <PlayIcon /> : <PauseIcon />}
                    </button>
                    <button>
                        <RightIcon />
                    </button>
                </div>
                <input
                    type="range"
                    min={0}
                    max={duration}
                    value={localPosition}
                    onChange={handleSeek}
                    style={{ width: "100%" }}
                />
                <div className="track-position">
                    <span>{countPosition(localPosition)}</span>
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
            src={`${API_BASE}/audio/${playbackState.entryId}`}
            playbackState={playbackState}
            updateTrackPosition={updateTrackPosition}
        />
    );
}