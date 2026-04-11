import { API_BASE } from "@/config";
import { IAudio, IPlaybackState, useListeningRoom } from "@/lib";
import React, { useEffect, useRef, useState } from "react";
import { PlaybackModeToggle } from "../PlaybackModeToggle";
import VolumeSlider from "../VolumeSlider/VolumeSlider";
import { audioService } from "@/lib/services/audio";
import { countPosition } from "@/lib/services/utils/interfaceFunctions";
import PauseIcon from "@/components/icons/PauseIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import LeftIcon from "@/components/icons/LeftIcon";
import RightIcon from "@/components/icons/RightIcon";
import styles from "./Audio.module.scss";
import PlusIcon from "@/components/icons/PlusIcon";
import DownIcon from "@/components/icons/DownIcon";

interface AudioTrackerProps {
    src: string;
    playbackState: IPlaybackState;
    updateTrackPosition: (entryId: number, position: number, pause: boolean) => void;
}

const AudioTracker: React.FC<AudioTrackerProps> = ({ src, playbackState, updateTrackPosition }) => {
    const { localPosition, setLocalPosition, playNext, playPrev } = useListeningRoom();

    const audioRef = useRef<HTMLAudioElement>(null);
    const lastTimeRef = useRef(0);
    const isProgrammaticRef = useRef(false);
    const hasUserInteractedRef = useRef(false);
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);
    const [fullPlayerOpen, setFullPlayerOpen] = useState<boolean>(false);

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
            text.classList.add(styles.animate);
        } else {
            text.classList.remove(styles.animate);
        }
    }, [audioInfo, fullPlayerOpen]);

    

    return (
        <>
            <audio ref={audioRef} preload="metadata" />
            <VolumeSlider audioRef={audioRef} visible={false}/>

            {fullPlayerOpen ? (
                <div className={styles.audioPlayer}>
                    <div className={styles.playerHeader}>
                        <button onClick={() => setFullPlayerOpen(false)}><DownIcon/></button>
                        <button>⋮</button>
                    </div>
                    <img src="/image/player.gif"/>
                    <div ref={headerRef} className={styles.header}>
                        <div ref={textRef} className={styles.headerText}>
                            {audioInfo?.name}
                        </div>
                    </div>
                    <div className={styles.tracker}>
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            value={localPosition}
                            onChange={handleSeek}
                            style={{ width: "100%", background: `linear-gradient(to right, #ffffff ${(localPosition / duration) * 100}%, #444 ${(localPosition / duration) * 100}%)`}}
                        />
                        
                        <div className={styles.positionMeta}>
                            <span className={styles.currentPosition}>{countPosition(localPosition)}</span>
                            <span className={styles.duration}>{countPosition(duration)}</span>
                        </div>
                    </div>
                    <div className={styles.navigation}>
                        <PlaybackModeToggle />
                        <button onClick={playPrev}>
                            <LeftIcon />
                        </button>
                        <button onClick={togglePlay}>
                            {paused ? <PlayIcon /> : <PauseIcon />}
                        </button>
                        <button onClick={playNext}>
                            <RightIcon />
                        </button>
                        <button><PlusIcon/></button>
                    </div>
                    <VolumeSlider audioRef={audioRef} />
                    {updateMessage && <div className={styles.update} onDoubleClick={() => setUpdateMessage("")}>{updateMessage}</div>}
                </div>
            ) : (
                <div className={styles.audioTracker} onClick={() => setFullPlayerOpen(true)}>
                    <div ref={headerRef} className={styles.header}>
                        <div ref={textRef} className={styles.headerText}>
                            {audioInfo?.name}
                        </div>
                    </div>
                    <div 
                        className={styles.trackPosition}
                        style={{ background: `linear-gradient(to right, #ffffff ${(localPosition / duration) * 100}%, #444 ${(localPosition / duration) * 100}%)`}}/>
                    
                    <div className={styles.navigation} onClick={(e) => e.stopPropagation()}>
                        <button onClick={togglePlay}>
                            {paused ? <PlayIcon /> : <PauseIcon />}
                        </button>
                        <button onClick={playNext}>
                            <RightIcon />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
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