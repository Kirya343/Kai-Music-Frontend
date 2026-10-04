import { useLibrary } from "@audio/hooks/useLibrary";
import styles from "./TrackImportLibrary.module.scss"
import ImportingTrack from "@/components/ui/track/ImportingTrack";
import { useMemo } from "react";
import { Playlist } from "@/lib/playlist";

const TrackImportLibrary = ({ importPlaylist }: { importPlaylist: Playlist }) => {

    const { 
        visibleAudios,
        setSearchQuery, searchQuery,
        rowVirtualizer, parentRef,
        filteredList
    } = useLibrary();

    const playlistAudioIds = useMemo(() => {
        return new Set(
            importPlaylist?.queue.map(item => item.audio.id)
        );
    }, [importPlaylist?.queue]);

    return (
        <div className={styles.page} ref={parentRef}>
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
                                    importPlaylistId={importPlaylist.id}
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

export default TrackImportLibrary;