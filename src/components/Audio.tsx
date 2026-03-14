import { API_BASE } from "@/config";
import { useEffect, useRef } from "react";

const Audio = ({ audioId }: { audioId: number | null }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.load();
    }, [audioId]);

    if (!audioId) return null;

    return (
        <audio ref={audioRef} controls>
            <source src={`${API_BASE}/audio/${audioId}`} type="audio/mpeg" />
            Your browser does not support the audio element.
        </audio>
    );
};

export default Audio;