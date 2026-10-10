import { CheckmarkIcon, PlusIcon } from "@/assets/icons";
import { playlistService } from "@/lib/playlist"
import { IAudio } from "@audio"
import Track from "./Track/Track"
import { HTMLAttributes } from "react";

/** Props for the ImportingTrack component */
interface ImportingTrackProps extends HTMLAttributes<HTMLDivElement> {
    /** Audio metadata to display */
    audio: IAudio;

    /** Position-based number displayed instead of the audio ID. */
    trackNumber: number;

    /** Whether the track is already in the room's queue. */
    isInPlaylist: boolean;

    /** ID of the playlist to add the track to. */
    importPlaylistId: number;
}

/** Displays an audio track with playlist import actions. */
const ImportingTrack = ({
    audio, 
    trackNumber,
    isInPlaylist,
    importPlaylistId,
    ...divProps
}: ImportingTrackProps) => {

    const actions = importPlaylistId ? [
        {
            icon: isInPlaylist ? <CheckmarkIcon/> : <PlusIcon/>,
            title: "Add to Room",
            func: () => playlistService.addToQueue(importPlaylistId, [{audioId: audio.id}])
        }
    ] : []

    return (
        <Track
            audio={audio}
            trackNumber={trackNumber}
            actions={actions}
            {...divProps}
        />
    )
}

export default ImportingTrack;
