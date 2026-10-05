import { IAudio } from "../audio";

export interface IListeningRoom extends IShortRoom{
    audio: IAudio;
}

export interface IShortRoom {
    id: number;
    title: string;
    ownerId: number;
    code: string;
    listeners: number;
    playlistId: number;
}

export interface IRoomUpdate {
    title: string;
}

export interface MainPageRequest {
    publicRooms: IShortRoom[];
    activeListners: number;
    activeRooms: number;
}