import { Playlist, useRoomPlayback } from "@/lib/playlist";
import styles from "./PlaylistsPage.module.scss"
import AudioPlayerOpener from "@/components/ui/player/AudioPlayerOpener/AudioPlayerOpener";
import { usePlaylists } from "@/lib/playlist/hooks/usePlaylists";
import CirclePlusIcon from "@/components/icons/CirclePlusIcon";
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinnerIcon";
import { useState } from "react";
import PlaylistCreateModal from "@/components/pages/playlists/PlaylistCreateModal/PlaylistCreateModal";
import ActionMenu, { IKebabAction } from "@/components/ui/ActionMenu/ActionMenu";
import TrashIcon from "@/components/icons/TrashIcon";

const PlaylistsPage = () => {

    const {
        loading, setSearchQuery,
        searchQuery, deletePlaylist,
        updatePlaylist, filteredPlaylists,
        createPlaylist, importToRoom
    } = usePlaylists();

    const [isOpen, setOpen] = useState(false);

    const { roomLoaded } = useRoomPlayback();

    return (
        <>
            <div className={styles.page}>
                <h2 className={styles.header}>Playlists</h2>

                <div className={styles.sorting}>

                    <div className={styles.row}>
                        <button className={styles.upload} onClick={() => setOpen(true)}>
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

                    {searchQuery.length != 0 && <span>Found {filteredPlaylists.length} playlists</span>}
                </div>

                {loading && (
                    <div className={styles.synchronization}>
                        <LoadingSpinnerIcon/>
                        <span>synchronization</span>
                    </div>
                )}
                
                <div className={styles.list}>
                    {filteredPlaylists.map((playlist) => (
                        <PlaylistCard
                            key={playlist.id}
                            playlist={playlist}
                            deletePlaylist={() => deletePlaylist(playlist)}
                            importToRoom={() => importToRoom(playlist)}
                        />
                    ))}
                </div>
            </div>

            <PlaylistCreateModal
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                createPlaylist={createPlaylist}
            />

            {roomLoaded && <AudioPlayerOpener />}
        </>
    )
}

const PlaylistCard = ({
    playlist,
    deletePlaylist,
    importToRoom
}: {
    playlist: Playlist
    deletePlaylist: () => void,
    importToRoom: () => void
}) => {

    const actions: IKebabAction[] = [
        {
            title: "Delete playlist",
            func: deletePlaylist,
            icon: <TrashIcon />
        },
        {
            title: "Import to room",
            func: deletePlaylist,
        }
    ]
    return (
        <article className={styles.playlistCard}>
            <span className={styles.title}>{playlist.title}</span>
            <ActionMenu actions={actions} className={styles.actions}/>
        </article>
    )
}

export default PlaylistsPage;