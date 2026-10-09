import { Playlist } from "@/lib/playlist";
import PlaylistCard from "./PlaylistCard/PlaylistCard";
import { IKebabAction } from "../KebabMenu/KebabMenu";
import { TrashIcon } from "@/assets/icons";
import { useNavigate } from "react-router-dom";

/**
 * LibraryPlaylist is modification of PlaylistCard, that displays on PlaylistsPage
 * 
 * @param playlist is playlist to display 
 * @param deletePlaylist is void to delete playlist
 * @param importToRoom is void to import playlist audios to currentRoom 
 */
const LibraryPlaylist = ({
    playlist,
    deletePlaylist,
    importToRoom
}: {
    playlist: Playlist;
    deletePlaylist: () => void,
    importToRoom: () => void
}) => {

    const navigate = useNavigate();

    const extraActions: IKebabAction[] = [
        {
            title: "Delete playlist",
            func: deletePlaylist,
            icon: <TrashIcon />
        },
        {
            title: "Import to room",
            func: importToRoom,
        }
    ]

    return <PlaylistCard onClick={() => navigate(`/playlists/${playlist.id}`)} playlist={playlist} extraActions={extraActions}/>
}

export default LibraryPlaylist;