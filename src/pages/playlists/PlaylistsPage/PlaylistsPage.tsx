import { useRoomPlayback } from "@/lib/playlist";
import styles from "./PlaylistsPage.module.scss"
import { CirclePlusIcon } from "@/assets/icons";
import { useState } from "react";
import PlaylistCreateModal from "@/components/pages/playlists/PlaylistCreateModal/PlaylistCreateModal";
import LibraryPlaylist from "@/components/ui/playlist/LibraryPlaylist";
import SearchableLayout from "@/components/layout/LibraryLayout/SearchableLayout";
import { useSearch } from "@common/utils/hooks/useSearch";
import { useData } from "@common";

const PlaylistsPage = () => {

    const { playlists } = useData();
    
    const { filteredList, searchQuery, setSearchQuery} = useSearch(playlists.data);

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
                        deletePlaylist={() => playlists.deletePlaylist(p)}
                        importToRoom={() => roomPlaylist && playlists.importToRoom(roomPlaylist, p)}
                    />
                ))}
            </div>

            <PlaylistCreateModal
                isOpen={isOpen}
                onClose={() => setOpen(false)}
            />
        </SearchableLayout>
    )
}

export default PlaylistsPage;