import RepeatAllIcon from "@/components/icons/playbackmode/RepeatAllIcon";
import NoRepeatIcon from "@/components/icons/playbackmode/NoRepeatIcon";
import RepeatOneIcon from "@/components/icons/playbackmode/RepeatOneIcon";
import ShuffleIcon from "@/components/icons/playbackmode/ShuffleIcon";
import { useRoomPlayback } from "@room";
import { PlaybackMode, playlistService } from "@/lib/playlist";

export const PlaybackModeToggle = () => {

    const { roomPlaylist, playbackMode } = useRoomPlayback();

    const nextMode = async () => {
        if (!roomPlaylist) return;
        
        const modes = [
            PlaybackMode.NORMAL,
            PlaybackMode.REPEAT_ALL,
            PlaybackMode.SHUFFLE,
            PlaybackMode.REPEAT_ONE
        ];

        const index = modes.indexOf(playbackMode);
        const next = modes[(index + 1) % modes.length];

        await playlistService.setPlaylistPlaybackMode(roomPlaylist?.id, next);
    };

    const icon = (() => {
        switch (playbackMode) {
            case PlaybackMode.NORMAL: return <NoRepeatIcon />;
            case PlaybackMode.REPEAT_ALL: return <RepeatAllIcon />;
            case PlaybackMode.SHUFFLE: return <ShuffleIcon />;
            case PlaybackMode.REPEAT_ONE: return <RepeatOneIcon />;
        }
    })();

    return <button onClick={nextMode}>{icon}</button>
};