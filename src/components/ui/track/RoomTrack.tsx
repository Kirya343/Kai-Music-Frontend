import { playlistService, useRoomPlayback } from "@/lib/playlist";
import Track, { ITrackAction } from "./Track/Track";
import { TrashIcon } from "@/assets/icons";
import { playbackService } from "@playback/services";
import { IQueueItem } from "@playback";

/** Props for the RoomTrack component */
interface RoomTrackProps {

    /** Playlist queue item with audio metadata to display */
    queueItem: IQueueItem, 

    /** Whether the track is currently selected. */
    selected: boolean, 

    /** Display a checkbox for track selection. */
    selectMode: boolean,

    /** Callback that toggles current track selection */
    toggleTrack: (id: number) => void,

    /** Apply the playing style and display the playback indicator. */
    playing: boolean
}

/** Displays audio track in the RoomPage */
const RoomTrack = ({
    queueItem, 
    selected, 
    selectMode, 
    toggleTrack, 
    playing
}: RoomTrackProps) => {

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

    const actions: ITrackAction[] = []

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
            trackNumber={queueItem.position + 1}
            noBorder
            actions={actions}
            visualProps={{
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