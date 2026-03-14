export interface IListeningRoom {
    id: number;
    title: string;
    ownerId: number;
    membersCount: number;
    queue: IQueueItem[]
}

export interface IQueueItem {
    id: number;
    audioId: number;
    name: string;
    position: number;
}

export interface IAudio {
    id: number;
    name: string;
}

export interface IPlaybackState {
    audioId: number;
    position: number;
    pause: boolean;
}