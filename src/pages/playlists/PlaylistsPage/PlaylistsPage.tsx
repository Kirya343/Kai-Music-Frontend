import { useRoomPlayback } from "@/lib/playlist";
import styles from "./PlaylistsPage.module.scss"
import { usePlaylists } from "@/lib/playlist/hooks/usePlaylists";
import { CirclePlusIcon } from "@/assets/icons";
import { useState } from "react";
import PlaylistCreateModal from "@/components/pages/playlists/PlaylistCreateModal/PlaylistCreateModal";
import LibraryPlaylist from "@/components/ui/playlist/LibraryPlaylist";
import PageLayout from "@/components/layout/PageLayout/PageLayout";
import SearchableLayout from "@/components/layout/LibraryLayout/SearchableLayout";

const PlaylistsPage = () => {

    const {
        setSearchQuery,
        searchQuery, deletePlaylist,
        filteredList,
        createPlaylist, importToRoom
    } = usePlaylists();

    const [isOpen, setOpen] = useState(false);

    const { roomPlaylist } = useRoomPlayback();

    return (
        <SearchableLayout
            title="Playlists"
            search={{searchQuery, setSearchQuery, filteredList}}
            extraActions={[
                <button className={styles.upload} onClick={() => setOpen(true)}>
                    <CirclePlusIcon />
                    <span>Create new</span>
                </button>
            ]}
        >
            <div className={styles.list}>
                {filteredList.map((p) => (
                    <LibraryPlaylist
                        key={p.id}
                        playlist={p}
                        deletePlaylist={() => deletePlaylist(p)}
                        importToRoom={() => roomPlaylist && importToRoom(roomPlaylist, p)}
                    />
                ))}
            </div>

            <PlaylistCreateModal
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                createPlaylist={createPlaylist}
            />
        </SearchableLayout>
    )
}

export default PlaylistsPage;