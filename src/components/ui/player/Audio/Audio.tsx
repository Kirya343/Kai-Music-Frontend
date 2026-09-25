import { useListeningRoom } from "@room";
import { useEffect, useRef } from "react";
import { PlaybackModeToggle } from "../PlaybackModeToggle";
import VolumeSlider from "../VolumeSlider/VolumeSlider";
import { countPosition } from "@common";
import PauseIcon from "@/components/icons/PauseIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import LeftIcon from "@/components/icons/LeftIcon";
import RightIcon from "@/components/icons/RightIcon";
import styles from "./Audio.module.scss";
import PlusIcon from "@/components/icons/PlusIcon";
import DownIcon from "@/components/icons/DownIcon";

const Audio = () => {
    const { 
        localPosition,
        playNext, playPrev, duration, 
        paused, updateMessage, 
        fullPlayerOpen, audioInfo,
        setFullPlayerOpen,
        togglePlay, seek,
        bufferedRanges,
        currentEntryId
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

    return currentEntryId ? (
        <>
            <VolumeSlider visible={false}/>

            {fullPlayerOpen && (
                <div className={styles.audioPlayer}>
                    <div className={styles.playerHeader}>
                        <button onClick={() => setFullPlayerOpen(false)}><DownIcon/></button>
                        <button>⋮</button>
                    </div>
                    <img src="/image/player.gif" />
                    <div ref={headerRef} className={styles.header}>
                        <div ref={textRef} className={styles.headerText}>
                            {audioInfo?.title ?? audioInfo?.name}
                        </div>
                    </div>
                    <div className={styles.tracker}>
                        <div className={styles.progress}>
                            <div className={styles.buffered}>
                                {bufferedRanges.get(currentEntryId)?.map((range, index) => (
                                    <div
                                        key={index}
                                        className={styles.bufferedRange}
                                        style={{
                                            left: `${(range.start / duration) * 100}%`,
                                            width: `${((range.end - range.start) / duration) * 100}%`
                                        }}
                                    />
                                ))}
                            </div>

                            <input
                                type="range"
                                min={0}
                                max={duration}
                                value={localPosition}
                                onChange={(e) => seek(Number(e.target.value))}
                                style={{
                                    width: "100%",
                                    background: `linear-gradient(
                                        to right,
                                        #ffffff ${(localPosition / duration) * 100}%,
                                        #00000000 ${(localPosition / duration) * 100}%
                                    )`
                                }}
                            />
                        </div>

                        <div className={styles.positionMeta}>
                            <span className={styles.currentPosition}>
                                {countPosition(localPosition)}
                            </span>

                            <span className={styles.duration}>
                                {countPosition(duration)}
                            </span>
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
                    <VolumeSlider />
                    {updateMessage && <div className={styles.update}>{updateMessage}</div>}
                </div>
            )}
        </>
    ) : <></>
};

export default Audio;