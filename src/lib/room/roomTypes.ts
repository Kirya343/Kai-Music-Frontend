import { IAudio } from "../audio";
import { Playlist } from "../playlist";

export interface IListeningRoom extends IShortRoom{
    playlist: Playlist;
    audio: IAudio;
}

export interface IShortRoom {
    id: number;
    title: string;
    ownerId: number;
    code: string;
    listeners: number;
}

export interface IRoomUpdate {
    title: string;
}