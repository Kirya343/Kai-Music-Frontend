import SelectPlaylist from "@/components/ui/playlist/SelectPlaylist";
import styles from "./TrackImportPlaylists.module.scss"
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Playlist } from "@/lib/playlist";
import { useData } from "@common";
import { useSearch } from "@common/utils/hooks/useSearch";

const TrackImportPlaylists = ({
    seePlaylist,
    importPlaylist
}: {
    seePlaylist: (playlistId: number) => void;
    importPlaylist: Playlist;
}) => {
    
    const { playlists } = useData();
    
    const { filteredList, searchQuery, setSearchQuery} = useSearch(playlists.data);

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
                            importToRoom={() => playlists.importToRoom(importPlaylist, playlist)}
                            onClick={() => seePlaylist(playlist.id)}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default TrackImportPlaylists;