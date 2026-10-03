import CheckmarkIcon from "@/components/icons/CheckmarkIcon"
import PenIcon from "@/components/icons/PenIcon"
import PlusIcon from "@/components/icons/PlusIcon"
import ShazamIcon from "@/components/icons/ShazamIcon"
import TrashIcon from "@/components/icons/TrashIcon"
import { playlistService } from "@/lib/playlist"
import { IAudio } from "@audio"
import Track from "./Track/Track"
import { IQueueItem } from "@playback"

const PlaylistTrack = ({
    queueItem, 
    id,
    playing,
    isInPlaylist,
    playlistId,
    className,
    recognizeAudio,
    openEditModal,
    handleRemove
}: {
    queueItem: IQueueItem, 
    id: number,
    playing: boolean,
    playlistId?: number,
    isInPlaylist: boolean,
    className?: string,
    recognizeAudio: (audio: IAudio) => void,
    openEditModal: (audio: IAudio) => void,
    handleRemove: (queueItem: IQueueItem) => void
}) => {

    const actions = [];

    const extraActions = [
            {
                icon: <ShazamIcon/>,
                title: "Autofill info with Shazam",
                func: () => recognizeAudio(queueItem.audio)
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