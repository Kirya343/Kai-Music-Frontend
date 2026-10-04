import { playlistService, useRoomPlayback } from "@/lib/playlist";
import Track from "./Track/Track";
import TrashIcon from "@/components/icons/TrashIcon";
import { IKebabAction } from "../ActionMenu/ActionMenu";
import { playbackService } from "@playback/services";
import { IQueueItem } from "@playback";

const RoomTrack = ({queueItem, selected, selectMode, toggleTrack, playing}: {
    queueItem: IQueueItem, 
    selected: boolean, 
    selectMode: boolean,
    toggleTrack: (id: number) => void,
    playing: boolean
}) => {

    const { 
        playbackState,
        room,
        togglePlay,
        roomPlaylist
    } = useRoomPlayback();

    const playTrack = playbackService.usePlayTrack();

    const handleTrackClick = async (qiId: number) => {
        if (!room?.id) return;

        if (selectMode) {
            toggleTrack(qiId)
        } else {
            if (playbackState?.entryId === qiId) {
                togglePlay()
            } else {
                playTrack(qiId)
            }
        }
    }

    const actions: IKebabAction[] = []

    if (roomPlaylist?.id) {
        actions.push({
            icon: <TrashIcon/>,
            title: "deleteAudio",
            func: async () => await playlistService.removeFromQueue(roomPlaylist?.id, [queueItem.id])
        })
    }


    return (
        <Track
            onClick={() => handleTrackClick(queueItem.id)}
            audio={queueItem.audio}
            id={queueItem.position + 1}
            noBorder
            actions={actions}
            props={{
                title: true,
                artist: true
            }}
            
            selectionMode={selectMode}
            selected={selected}

            playing={playing}
        />
    )
}

export default RoomTrack;