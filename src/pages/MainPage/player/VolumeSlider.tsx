import { useEffect, useState } from "react";

type Props = {
    audioRef: React.RefObject<HTMLAudioElement | null>;
};

export default function VolumeSlider({ audioRef }: Props) {

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

    return (
        <input
            className="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleChange}
        />
    );
}