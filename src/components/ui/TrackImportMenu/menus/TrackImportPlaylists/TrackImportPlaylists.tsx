import SelectPlaylist from "@/components/ui/playlist/SelectPlaylist";
import { usePlaylists } from "@/lib/playlist/hooks/usePlaylists";
import styles from "./TrackImportPlaylists.module.scss"
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinnerIcon";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";

const TrackImportPlaylists = ({
    seePlaylist,
    importPlaylistId
}: {
    seePlaylist: (playlistId: number) => void;
    importPlaylistId: number;
}) => {
    const {
        setSearchQuery,
        searchQuery, filteredList
    } = usePlaylists();

    return (
        <>
            <div className={styles.page}>
                <h2 className={styles.header}>Playlists</h2>

                <div className={styles.sorting}>

                    <div className={styles.row}>
                        <SearchInput onChange={(value) => setSearchQuery(value)} value={searchQuery}/>
                    </div>

                    {searchQuery.length != 0 && <span>Found {filteredList.length} playlists</span>}
                </div>

                <div className={styles.list}>
                    {filteredList.map((playlist) => (
                        <SelectPlaylist
                            key={playlist.id}
                            playlist={playlist}
                            onClick={() => seePlaylist(playlist.id)}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default TrackImportPlaylists;