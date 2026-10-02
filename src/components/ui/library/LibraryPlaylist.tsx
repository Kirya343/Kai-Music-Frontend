import { Playlist } from "@/lib/playlist";
import PlaylistCard from "./PlaylistCard/PlaylistCard";
import { IKebabAction } from "../ActionMenu/ActionMenu";
import TrashIcon from "@/components/icons/TrashIcon";

const LibraryPlaylist = ({
    playlist,
    deletePlaylist,
    importToRoom
}: {
    playlist: Playlist;
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
            func: importToRoom,
        }
    ]

    return <PlaylistCard playlist={playlist} actions={actions}/>
}

export default LibraryPlaylist;