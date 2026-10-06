import { CheckmarkIcon, PlusIcon } from "@/assets/icons";
import { playlistService } from "@/lib/playlist"
import { IAudio } from "@audio"
import Track from "./Track/Track"

const ImportingTrack = ({
    audio, 
    id,
    isInPlaylist,
    importPlaylistId,
    className,
}: {
    audio: IAudio, 
    id: number,
    isInPlaylist: boolean,
    importPlaylistId: number,
    className?: string,
}) => {

    const actions = importPlaylistId ? [
        {
            icon: isInPlaylist ? <CheckmarkIcon/> : <PlusIcon/>,
            title: "Add to Room",
            func: async () => await playlistService.addToQueue(importPlaylistId, [{audioId: audio.id}])
        }
    ] : []

    return (
        <Track
            audio={audio}
            id={id}
            actions={actions}
            className={className}
        />
    )
}

export default ImportingTrack;
