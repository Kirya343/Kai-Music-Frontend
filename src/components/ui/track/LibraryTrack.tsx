import CheckmarkIcon from "@/components/icons/CheckmarkIcon"
import PenIcon from "@/components/icons/PenIcon"
import PlusIcon from "@/components/icons/player/PlusIcon"
import ShazamIcon from "@/components/icons/ShazamIcon"
import TrashIcon from "@/components/icons/TrashIcon"
import { playlistService } from "@/lib/playlist"
import { audioService, IAudio } from "@audio"
import Track from "./Track/Track"

const LibraryTrack = ({
    audio, 
    id,
    playing,
    playlistId,
    className,
    openEditModal,
    handleDelete
}: {
    audio: IAudio, 
    id: number,
    playing: boolean,
    playlistId?: number,
    className?: string,
    openEditModal: (audio: IAudio) => void,
    handleDelete: (audio: IAudio) => void
}) => {

    const actions = [];

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

    if (playlistId) {
        const action = {
            icon: <PlusIcon/>,
            title: "Add to Room",
            func: async () => await playlistService.addToQueue(playlistId, [{audioId: audio.id}])
        }

        extraActions.push(action)
    }
    return (
        <Track
            audio={audio}
            id={id}
            extraActions={extraActions}
            className={className}
            playing={playing}
        />
    )
}

export default LibraryTrack;