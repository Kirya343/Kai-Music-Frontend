import { useRoomPlayback } from "@room";
import { useEffect, useRef } from "react";

import styles from "./AudioPlayerOpener.module.scss"
import { RightIcon, PlayIcon, PauseIcon } from "@/assets/icons";
import { playbackService } from "@playback/services";

const AudioPlayerOpener = () => {

    const { 
        playbackState, playingAudio, 
        fullPlayerOpen, setFullPlayerOpen, 
        togglePlay 
    } = useRoomPlayback();

    const playTrack = playbackService.usePlayTrack();

    const headerRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);
    const duration = playingAudio?.duration || 0

    useEffect(() => {
        const header = headerRef.current;
        const text = textRef.current;

        if (!header || !text) return;

        if (text.scrollWidth > header.clientWidth) {
            text.classList.add(styles.animate);
        } else {
            text.classList.remove(styles.animate);
        }
    }, [playingAudio, fullPlayerOpen]);

    return playingAudio && playbackState && (
        <div className={styles.audioTracker} onClick={() => setFullPlayerOpen(true)}>
            <div ref={headerRef} className={styles.header}>
                <div ref={textRef} className={styles.headerText}>
                    {playingAudio?.title ?? playingAudio?.name}
                </div>
            </div>
            <div 
                className={styles.trackPosition}
                style={{ 
                    background: `
                        linear-gradient(to right, #ffffff ${(playbackState.position / duration) * 100}%, 
                        #444 ${(playbackState.position / duration) * 100}%)
                    `
                }}
            />
            
            <div className={styles.navigation} onClick={(e) => e.stopPropagation()}>
                <button onClick={togglePlay}>
                    {playbackState.pause ? <PlayIcon /> : <PauseIcon />}
                </button>
                <button onClick={() => playTrack("next")}>
                    <RightIcon />
                </button>
            </div>
        </div>
    );
}

export default AudioPlayerOpener;