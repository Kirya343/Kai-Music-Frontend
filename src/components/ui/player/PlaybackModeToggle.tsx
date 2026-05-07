import RepeatAllIcon from "@/components/icons/player/RepeatAllIcon";
import NoRepeatIcon from "@/components/icons/player/NoRepeatIcon";
import RepeatOneIcon from "@/components/icons/player/RepeatOneIcon";
import ShuffleIcon from "@/components/icons/player/ShuffleIcon";
import { useListeningRoom } from "@/lib";
import { audioService } from "@/lib/services/audio";
import { useState } from "react";

export enum PlaybackMode {
    NORMAL = "NORMAL",
    REPEAT_ALL = "REPEAT_ALL",
    SHUFFLE = "SHUFFLE",
    REPEAT_ONE = "REPEAT_ONE"
}

export const PlaybackModeToggle = () => {

    const { room } = useListeningRoom();

    const [currentMode, setCurrentMode] = useState<PlaybackMode>(room?.mode || PlaybackMode.NORMAL);
    const nextMode = async () => {
        if (!room) return;
        const next = (() => {
            switch (currentMode) {
                case PlaybackMode.NORMAL: return PlaybackMode.REPEAT_ALL;
                case PlaybackMode.REPEAT_ALL: return PlaybackMode.SHUFFLE;
                case PlaybackMode.SHUFFLE: return PlaybackMode.REPEAT_ONE;
                case PlaybackMode.REPEAT_ONE: return PlaybackMode.NORMAL;
            }
        })();

        const res = await audioService.setRoomPlaybackMode(room?.id, next);
        if (res.ok) setCurrentMode(next)
    };

    return (
        <button onClick={nextMode}>
            {currentMode == PlaybackMode.NORMAL && <NoRepeatIcon />}
            {currentMode == PlaybackMode.REPEAT_ALL && <RepeatAllIcon />}
            {currentMode == PlaybackMode.SHUFFLE && <ShuffleIcon />}
            {currentMode == PlaybackMode.REPEAT_ONE && <RepeatOneIcon />}
        </button>
    );
};