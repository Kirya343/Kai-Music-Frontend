import { PenIcon, PlusIcon, ShazamIcon, TrashIcon } from "@/assets/icons";
import { playlistService } from "@/lib/playlist"
import { audioService, IAudio } from "@audio"
import Track from "./Track/Track"
import { HTMLAttributes } from "react";

/**
 * Props for the LibraryTrack component
 */
interface LibraryTrackProps extends HTMLAttributes<HTMLDivElement> {
    /** Audio metadata to display */
    audio: IAudio;

    /** Position-based number displayed instead of the audio ID. */
    trackNumber: number;
    
    /** Apply the playing style and display the playback indicator. */
    playing: boolean;
    
    /** ID of the playlist to add the track to. */
    importPlaylistId: number;

    /** Opens the audio editing modal. */
    openEditModal: (audio: IAudio) => void;

    /** Deletes current audio from library */
    handleDelete: (audio: IAudio) => void;
}

/** Displays an audio track with control actions. */
const LibraryTrack = ({
    audio, 
    trackNumber,
    playing,
    importPlaylistId,
    openEditModal,
    handleDelete,
    ...divProps
}: LibraryTrackProps) => {

    const extraActions = [
        {
            icon: <ShazamIcon/>,
            title: "Autofill info with Shazam",
            func: async () => await audioService.recognizeAudio(audio.id)
        },
        {
            icon: <PenIcon/>,
            title: "Edit audio info",
            func: () => openEditModal(audio)
        },
        {
            icon: <TrashIcon/>,
            title: "Delete from library",
            func: () => handleDelete(audio)
        }
    ]

    if (importPlaylistId) {
        const action = {
            icon: <PlusIcon/>,
            title: "Add to Room",
            func: async () => await playlistService.addToQueue(importPlaylistId, [{audioId: audio.id}])
        }

        extraActions.push(action)
    }

    return (
        <Track
            audio={audio}
            trackNumber={trackNumber}
            extraActions={extraActions}
            playing={playing}
            {...divProps}
        />
    )
}

export default LibraryTrack;