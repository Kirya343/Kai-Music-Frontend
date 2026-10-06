import { TrashIcon, CheckmarkIcon, PenIcon, PlusIcon, ShazamIcon } from "@/assets/icons"
import { playlistService } from "@/lib/playlist"
import { audioService, IAudio } from "@audio"
import Track from "./Track/Track"
import { IQueueItem } from "@playback"

const PlaylistTrack = ({
    queueItem, 
    id,
    playing,
    isInPlaylist,
    playlistId,
    className,
    openEditModal,
    handleRemove
}: {
    queueItem: IQueueItem, 
    id: number,
    playing: boolean,
    playlistId?: number,
    isInPlaylist: boolean,
    className?: string,
    openEditModal: (audio: IAudio) => void,
    handleRemove: (queueItem: IQueueItem) => void
}) => {

    const actions = [];

    const extraActions = [
            {
                icon: <ShazamIcon/>,
                title: "Autofill info with Shazam",
                func: async () => await audioService.recognizeAudio(queueItem.audio.id)
            },
            {
                icon: <PenIcon/>,
                title: "Edit audio info",
                func: () => openEditModal(queueItem.audio)
            },
            {
                icon: <TrashIcon/>,
                title: "Remove from playlist",
                func: () => handleRemove(queueItem)
            }
        ]

    if (playlistId) {
        const action = {
            icon: isInPlaylist ? <CheckmarkIcon/> : <PlusIcon/>,
            title: "Add to Room",
            func: async () => await playlistService.addToQueue(playlistId, [{audioId: queueItem.audio.id}])
        }

        extraActions.push(action)
        actions.push(action)
    }

    return (
        <Track
            audio={queueItem.audio}
            id={id}
            actions={actions}
            extraActions={extraActions}
            className={className}
            playing={playing}
        />
    )
}

export default PlaylistTrack;