import { useCallback } from "react"
import { useRoomPlayback } from "@room"
import { playbackService } from ".";

export const usePlayTrack = () => {

    const { room } = useRoomPlayback();

    const playTrack = useCallback(async (track: "next" | "prev" | number) => {
        if (!room?.id) return;

        await playbackService.playTrack(room?.id, track)
    }, [room?.id])

    return playTrack;
}