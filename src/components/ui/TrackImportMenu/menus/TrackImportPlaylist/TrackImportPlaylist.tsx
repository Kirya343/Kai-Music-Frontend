import ImportingTrack from "@/components/ui/library/ImportingTrack";
import styles from "./TrackImportPlaylist.module.scss"
import { usePlaylist } from "@/lib/playlist/hooks/usePlaylist";
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinnerIcon";
import { useMemo } from "react";
import { Playlist } from "@/lib/playlist";

const TrackImportPlaylist = ({
    playlistId,
    importPlaylist
}: {
    playlistId: number,
    importPlaylist: Playlist
}) => {

    const { 
        loading, 
        setSearchQuery, searchQuery,
        filteredList, pagePlaylist
    } = usePlaylist(playlistId);
    
    const playlistAudioIds = useMemo(() => {
        return new Set(
            importPlaylist?.queue.map(item => item.audio.id)
        );
    }, [importPlaylist?.queue]);

    return (
        <div className={styles.page}>
            <h2 className={styles.header}>Playlist <strong>{pagePlaylist?.title}</strong></h2>
            
            <div className={styles.sorting}>

                <div className={styles.row}>
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
                    <ImportingTrack
                        audio={qi.audio}
                        id={idx + 1}
                        isInPlaylist={playlistAudioIds.has(qi.audio.id)}
                        importPlaylistId={importPlaylist.id}
                        className={styles.track}
                    />
                ))}
            </div>
        </div>
    )
}

export default TrackImportPlaylist;