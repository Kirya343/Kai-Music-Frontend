import styles from "./TrackImportModal.module.scss"
import { useState } from "react";
import TrackImportLibrary from "./menus/TrackImportLibrary/TrackImportLibrary";
import TrackImportPlaylists from "./menus/TrackImportPlaylists/TrackImportPlaylists";
import TrackImportPlaylist from "./menus/TrackImportPlaylist/TrackImportPlaylist";
import LeftArrowIcon from "@/components/icons/arrows/LeftArrowIcon";
import clsx from "clsx";
import { Playlist } from "@/lib/playlist";

const TrackImportModal = ({ 
    importPlaylist,
    isOpen,
    onClose 
}: { 
    onClose: () => void;
    isOpen: boolean;
    importPlaylist: Playlist; 
}) => {

    const [view, setView] = useState<"library" | "playlists" | number>("library");

    const seePlaylist = (id: number) => setView(id) 

    const renderView = () => {
        switch (view) {
            case "library": return <TrackImportLibrary importPlaylist={importPlaylist}/>
            case "playlists": return <TrackImportPlaylists importPlaylist={importPlaylist} seePlaylist={(id) => seePlaylist(id)}/>
            default: {
                if (!importPlaylist) return null;
                    
                return <TrackImportPlaylist playlistId={view} importPlaylist={importPlaylist} />
            }
        }
    }

    return isOpen && (
        <div className={styles.layout}>
            <div className={styles.page}>
                <div className={styles.header}>
                    <button onClick={() => onClose()} className={styles.closeBtn}><LeftArrowIcon/></button>
                    <h2 className={styles.header}>Add tracks</h2>
                </div>

                <div className={styles.menusList}>
                    <button onClick={() => setView("library")} className={clsx(styles.menu, view === "library" && styles.active)}>Tracks</button>
                    <button onClick={() => setView("playlists")} className={clsx(styles.menu, view === "playlists" && styles.active)}>Playlists</button>
                </div>
                
                {renderView()}
            </div>
        </div>
    );
}

export default TrackImportModal;