import styles from "./PlaylistPage.module.scss"
import { usePlaylist } from "@/lib/playlist/hooks/usePlaylist";
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinnerIcon";
import { useMemo, useState } from "react";
import { useRoomPlayback } from "@/lib/playlist";
import { IAudio } from "@audio";
import AudioFileModal from "@/components/pages/library/AudioFileModal/AudioFileModal";
import PlaylistTrack from "@/components/ui/library/PlaylistTrack";
import { useParams } from "react-router-dom";
import TrackImportModal from "@/components/ui/TrackImportMenu/TrackImportModal";
import CirclePlusIcon from "@/components/icons/CirclePlusIcon";

const PlaylistPage = ({}: {}) => {

    const { id } = useParams<{ id: string }>();

    const playlistId = Number(id)
    
    const [audioFileView, setAudioFileView] = useState<IAudio | null>(null);
    const [importOpen, setImportOpen] = useState<boolean>(false)

    const { playlist, playbackState } = useRoomPlayback();

    const { 
        loading, recognizeAudio,
        setSearchQuery, searchQuery,
        filteredList, pagePlaylist,
        updateAudio, removeAudio
    } = usePlaylist(playlistId);

    const playingAudioId = useMemo(() => {
        return playlist?.queue.find(
            item => item.id === playbackState?.entryId
        )?.audio.id;
    }, [playlist?.queue, playbackState?.entryId]);


    return (
        <>
            <div className={styles.page}>
                <h2 className={styles.header}>Playlist <strong>{pagePlaylist?.title}</strong></h2>
                
                <div className={styles.sorting}>

                    <div className={styles.row}>
                        <button className={styles.upload} onClick={() => setImportOpen(true)}>
                            <CirclePlusIcon solid />
                            <span>Create new</span>
                        </button>

                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.search}
                            placeholder="Search audios..."
                        />
                    </div>

                    {searchQuery.length != 0 && <span>Found {filteredList.length} audios</span>}
                </div>

                {loading && (
                    <div className={styles.synchronization}>
                        <LoadingSpinnerIcon />
                        <span>synchronization</span>
                    </div>
                )}
                
                <div className={styles.trackList}>
                    {filteredList.map((qi, idx) => (
                        <PlaylistTrack
                            queueItem={qi}
                            id={idx + 1}
                            isInPlaylist={false}
                            recognizeAudio={recognizeAudio}
                            playlistId={pagePlaylist?.id}
                            openEditModal={setAudioFileView}
                            handleRemove={removeAudio}
                            playing={playingAudioId === qi.audio.id}
                        />
                    ))}
                </div>

                <AudioFileModal
                    audioFile={audioFileView} 
                    onClose={() => setAudioFileView(null)} 
                    updateAudio={updateAudio}
                />
            </div>

            {pagePlaylist && <TrackImportModal importPlaylist={pagePlaylist} isOpen={importOpen} onClose={() => setImportOpen(false)} />}
        </>
    )
}

export default PlaylistPage;