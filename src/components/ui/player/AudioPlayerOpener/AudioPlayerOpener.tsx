import { useListeningRoom } from "@/lib";
import { useEffect, useRef } from "react";

import styles from "./AudioPlayerOpener.module.scss"
import PlayIcon from "@/components/icons/PlayIcon";
import PauseIcon from "@/components/icons/PauseIcon";
import RightIcon from "@/components/icons/RightIcon";

const AudioPlayerOpener = () => {

    const { 
        localPosition, playNext, audioInfo, 
        fullPlayerOpen, setFullPlayerOpen, 
        paused, duration, togglePlay 
    } = useListeningRoom();

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
        <div className={`${styles.audioTracker}`} onClick={() => setFullPlayerOpen(true)}>
            <div ref={headerRef} className={styles.header}>
                <div ref={textRef} className={styles.headerText}>
                    {audioInfo?.title ?? audioInfo?.name}
                </div>
            </div>
            <div 
                className={styles.trackPosition}
                style={{ background: `linear-gradient(to right, #ffffff ${(localPosition / duration) * 100}%, #444 ${(localPosition / duration) * 100}%)`}}
            />
            
            <div className={styles.navigation} onClick={(e) => e.stopPropagation()}>
                <button onClick={togglePlay}>
                    {paused ? <PlayIcon /> : <PauseIcon />}
                </button>
                <button onClick={playNext}>
                    <RightIcon />
                </button>
            </div>
        </div>
    );
}

export default AudioPlayerOpener;