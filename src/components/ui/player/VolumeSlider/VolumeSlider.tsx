import { useEffect, useState } from "react";
import styles from "./VolumeSlider.module.scss"
import { useListeningRoom } from "@/lib";

type Props = {
    visible?: boolean;
};

export default function VolumeSlider({ visible = true }: Props) {

    const { audioRef } = useListeningRoom();

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