import { useLibrary } from "@audio/hooks/useLibrary";
import styles from "./Library.module.scss"
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinnerIcon";
import ImportingTrack from "@/components/ui/library/ImportingTrack";
import { useMemo } from "react";
import { useRoomPlayback } from "@playback";

const Library = ({ importPlaylistId }: { importPlaylistId: number }) => {

    const { 
        visibleAudios, loading, 
        setSearchQuery, searchQuery,
        rowVirtualizer, parentRef,
        filteredList
    } = useLibrary();

    const { playlist } = useRoomPlayback();

    const playlistAudioIds = useMemo(() => {
        return new Set(
            playlist?.queue.map(item => item.audio.id)
        );
    }, [playlist?.queue]);

    return (
        <div className={styles.page} ref={parentRef}>
            <h2 className={styles.header}>Add tracks</h2>
            
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
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        position: "relative",
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map(item => {
                        const audio = visibleAudios[item.index];

                        return (
                            <div
                                key={audio.id}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    transform: `translateY(${item.start}px)`,
                                }}
                            >
                                <ImportingTrack
                                    audio={audio}
                                    id={item.index + 1}
                                    isInPlaylist={playlistAudioIds.has(audio.id)}
                                    importPlaylistId={importPlaylistId}
                                    className={styles.track}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Library;