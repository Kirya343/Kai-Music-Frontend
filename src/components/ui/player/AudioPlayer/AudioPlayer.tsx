import { useRoomPlayback } from "@room";
import { useEffect, useRef } from "react";
import { PlaybackModeToggle } from "../PlaybackModeToggle";
import VolumeSlider from "../VolumeSlider/VolumeSlider";
import { countPosition } from "@common";
import styles from "./AudioPlayer.module.scss";
import { PlusIcon, DownIcon, RightIcon, LeftIcon, PlayIcon, PauseIcon } from "@/assets/icons";
import { playbackService } from "@playback/services";

/**
 * Audio is component that contains main player
 * gives to user access to controll playback
 */
const AudioPlayer = () => {

    // controls from RoomPlaybackContext
    const {  
        updateMessage, 
        fullPlayerOpen, playingAudio,
        setFullPlayerOpen,
        togglePlay, seek,
        bufferedRanges,
        playbackState
    } = useRoomPlayback();

    const playTrack = playbackService.usePlayTrack();

    // variables to control the scrolling title
    const headerRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);
    const duration = playingAudio?.duration || 0

    // scrolling title control
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

    // displays only if playbackState is loaded
    return playbackState ? (
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
                            {playingAudio?.title ?? playingAudio?.name}
                        </div>
                    </div>
                    <div className={styles.tracker}>
                        <div className={styles.progress}>
                            <div className={styles.buffered}>
                                {bufferedRanges.get(playbackState.entryId)?.map((range, index) => (
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
                                value={playbackState.position}
                                onChange={(e) => seek(Number(e.target.value))}
                                style={{
                                    width: "100%",
                                    background: `linear-gradient(
                                        to right,
                                        #ffffff ${(playbackState.position / duration) * 100}%,
                                        #00000000 ${(playbackState.position / duration) * 100}%
                                    )`
                                }}
                            />
                        </div>

                        <div className={styles.positionMeta}>
                            <span className={styles.currentPosition}>
                                {countPosition(playbackState.position)}
                            </span>

                            <span className={styles.duration}>
                                {countPosition(duration)}
                            </span>
                        </div>
                    </div>
                    <div className={styles.navigation}>
                        <PlaybackModeToggle />
                        <button 
                            onClick={() => playTrack("prev")}
                        >
                            <LeftIcon />
                        </button>
                        <button onClick={togglePlay}>
                            {playbackState.pause ? <PlayIcon /> : <PauseIcon />}
                        </button>
                        <button 
                            onClick={() => playTrack("next")}>
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

export default AudioPlayer;