import CheckmarkIcon from "@/components/icons/CheckmarkIcon"
import PenIcon from "@/components/icons/PenIcon"
import PlusIcon from "@/components/icons/PlusIcon"
import ShazamIcon from "@/components/icons/ShazamIcon"
import TrashIcon from "@/components/icons/TrashIcon"
import { playlistService } from "@/lib/playlist"
import { IAudio } from "@audio"
import Track from "./Track/Track"

const LibraryTrack = ({
    audio, 
    id,
    playing,
    isInPlaylist,
    playlistId,
    className,
    recognizeAudio,
    openEditModal,
    handleDelete
}: {
    audio: IAudio, 
    id: number,
    playing: boolean,
    playlistId?: number,
    isInPlaylist: boolean,
    className?: string,
    recognizeAudio: (audio: IAudio) => void,
    openEditModal: (audio: IAudio) => void,
    handleDelete: (audio: IAudio) => void
}) => {

    const actions = [];

    const extraActions = [
            {
                icon: <ShazamIcon/>,
                title: "Autofill info with Shazam",
                func: () => recognizeAudio(audio)
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

    if (playlistId) {
        const action = {
            icon: isInPlaylist ? <CheckmarkIcon/> : <PlusIcon/>,
            title: "Add to Room",
            func: async () => await playlistService.addToQueue(playlistId, [{audioId: audio.id}])
        }

        extraActions.push(action)
        actions.push(action)
    }
    return (
        <Track
            audio={audio}
            id={id}
            actions={actions}
            extraActions={extraActions}
            className={className}
            playing={playing}
        />
    )
}

export default LibraryTrack;