import { Playlist } from "@/lib/playlist"
import PlaylistCard from "./PlaylistCard/PlaylistCard"
import { IKebabAction } from "../ActionMenu/ActionMenu";

const SelectPlaylist = ({
    playlist,
    importToRoom,
    onClick
}: {
    playlist: Playlist;
    onClick: () => void;
    importToRoom: () => void;
}) => {
    const extraActions: IKebabAction[] = [
        {
            title: "Import to room",
            func: importToRoom,
        }
    ]

    return <PlaylistCard playlist={playlist} onClick={onClick} extraActions={extraActions}/>
}

export default SelectPlaylist;