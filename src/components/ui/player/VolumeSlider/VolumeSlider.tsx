import { useEffect, useState } from "react";
import styles from "./VolumeSlider.module.scss"

type Props = {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    visible?: boolean;
};

export default function VolumeSlider({ audioRef, visible = true }: Props) {

    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem("audioVolume");
        return saved ? Number(saved) : 1;
    });

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume;
    }, [volume, audioRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        setVolume(v);
        localStorage.setItem("audioVolume", String(v));
    };

    return visible && (
        <input
            className={styles.volumeSlider}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleChange}
        />
    );
}