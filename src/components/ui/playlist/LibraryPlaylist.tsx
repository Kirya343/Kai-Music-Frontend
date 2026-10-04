import { Playlist } from "@/lib/playlist";
import PlaylistCard from "./PlaylistCard/PlaylistCard";
import { IKebabAction } from "../ActionMenu/ActionMenu";
import TrashIcon from "@/components/icons/TrashIcon";
import { useNavigate } from "react-router-dom";

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