import styles from "./PlaylistPage.module.scss"
import { usePlaylist } from "@/lib/playlist/hooks/usePlaylist";
import { useMemo, useState } from "react";
import { useRoomPlayback } from "@/lib/playlist";
import { IAudio } from "@audio";
import AudioFileModal from "@/components/pages/library/AudioFileModal/AudioFileModal";
import PlaylistTrack from "@/components/ui/track/PlaylistTrack";
import { useParams } from "react-router-dom";
import { CirclePlusIcon } from "@/assets/icons";
import SearchableLayout from "@/components/layout/LibraryLayout/SearchableLayout";

const PlaylistPage = ({}: {}) => {

    const { id } = useParams<{ id: string }>();

    const playlistId = Number(id)
    
    const [audioFileView, setAudioFileView] = useState<IAudio | null>(null);
    const [importOpen, setImportOpen] = useState<boolean>(false)

    const { roomPlaylist, playbackState } = useRoomPlayback();

    const { 
        setSearchQuery, searchQuery,
        filteredList, playlist,
        removeAudio
    } = usePlaylist(playlistId);

    const playingAudioId = useMemo(() => {
        return roomPlaylist?.queue.find(
            item => item.id === playbackState?.entryId
        )?.audio.id;
    }, [roomPlaylist?.queue, playbackState?.entryId]);


    return (
        <SearchableLayout
            title={playlist?.title || ""}
            search={{searchQuery, setSearchQuery, filteredList}}
            extraActions={[
                <button className={styles.upload} onClick={() => setImportOpen(true)}>
                    <CirclePlusIcon />
                    <span>Create new</span>
                </button>
            ]}
        >
            <div className={styles.trackList}>
                {filteredList.map((qi, idx) => (
                    <PlaylistTrack
                        queueItem={qi}
                        id={idx + 1}
                        isInPlaylist={false}
                        playlistId={playlist?.id}
                        openEditModal={setAudioFileView}
                        handleRemove={removeAudio}
                        playing={playingAudioId === qi.audio.id}
                    />
                ))}
            </div>

            <AudioFileModal
                audioFile={audioFileView} 
                onClose={() => setAudioFileView(null)} 
            />
        </SearchableLayout>
    )
}

export default PlaylistPage;