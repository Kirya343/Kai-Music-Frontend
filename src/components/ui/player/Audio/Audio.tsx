import { IPlaybackState, useListeningRoom } from "@/lib";
import React, { useEffect, useRef, useState } from "react";
import { PlaybackModeToggle } from "../PlaybackModeToggle";
import VolumeSlider from "../VolumeSlider/VolumeSlider";
import { countPosition } from "@/lib/services/utils/interfaceFunctions";
import PauseIcon from "@/components/icons/PauseIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import LeftIcon from "@/components/icons/LeftIcon";
import RightIcon from "@/components/icons/RightIcon";
import styles from "./Audio.module.scss";
import PlusIcon from "@/components/icons/PlusIcon";
import DownIcon from "@/components/icons/DownIcon";

const Audio = () => {
    const { 
        localPosition, setLocalPosition, 
        playNext, playPrev, duration, 
        paused, currentAudioId, 
        audioInfo, fullPlayerOpen, 
        setFullPlayerOpen, audioRef,
        togglePlay, sendUserUpdate, 
        playbackState
    } = useListeningRoom();

    const [updateMessage, setUpdateMessage] = useState<string | null>(null);

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

        if (playbackState) writeUpdateMessage(playbackState);
    }, [playbackState])

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
            <VolumeSlider audioRef={audioRef} visible={false}/>

            {fullPlayerOpen && (
                <div className={styles.audioPlayer}>
                    <div className={styles.playerHeader}>
                        <button onClick={() => setFullPlayerOpen(false)}><DownIcon/></button>
                        <button>⋮</button>
                    </div>
                    <img src="/image/player.gif"/>
                    <div ref={headerRef} className={styles.header}>
                        <div ref={textRef} className={styles.headerText}>
                            {audioInfo?.title ?? audioInfo?.name}
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
            )}
        </>
    )
};

export default Audio;