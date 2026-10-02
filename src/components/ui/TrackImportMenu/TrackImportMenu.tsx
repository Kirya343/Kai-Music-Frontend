import styles from "./TrackImportMenu.module.scss"
import { useState } from "react";
import { useRoomPlayback } from "@playback";
import Library from "./menus/Library/Library";
import Playlists from "./menus/Playlists/Playlists";
import Playlist from "./menus/Playlist/Playlist";

const TrackImportMenu = ({ importPlaylistId }: { importPlaylistId: number }) => {
    
    const { playlist } = useRoomPlayback();

    const [page, setPage] = useState<"library" | "playlists" | number>("library")

    const seePlaylist = (id: number) => setPage(id) 

    const renderPage = () => {
        switch (page) {
            case "library": return <Library importPlaylistId={importPlaylistId}/>
            case "playlists": return <Playlists importPlaylistId={importPlaylistId} seePlaylist={(id) => seePlaylist(id)}/>
            default: {
                if (!playlist) return null;
                    
                return <Playlist playlistId={page} importPlaylist={playlist} />
            }
        }
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.header}>Add tracks</h2>
            
            {renderPage()}
        </div>
    );
}

export default TrackImportMenu;