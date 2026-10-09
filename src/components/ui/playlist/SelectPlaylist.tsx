import { Playlist } from "@/lib/playlist"
import PlaylistCard from "./PlaylistCard/PlaylistCard"
import { IKebabAction } from "../KebabMenu/KebabMenu";

/**
 * LibraryPlaylist is modification of SelectPlaylist, that displays in TrackImportPlaylists
 * 
 * @param playlist is playlist to display 
 * @param onClick is void that works on card click
 * @param importToRoom is void to import playlist audios to currentRoom 
 */
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