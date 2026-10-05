import { createApi } from "@common";
import { IListeningRoom, IRoomUpdate, MainPageRequest } from "@room";

const roomApi = createApi("/room")

export const loadCurrentRoom = () => roomApi.get<IListeningRoom>("");

export const getRoomsPage = () => roomApi.get<MainPageRequest>(`/list/page`)
export const createRoom = () => roomApi.post<void>("")
export const joinRoom = (code: string) => roomApi.post<void>(`/join`, {}, { params: { code }})
export const leaveRoom = () => roomApi.post<void>(`/leave`)

export const updateRoom = (roomId: number, room: IRoomUpdate) => roomApi.post<void>(`/${roomId}`, room)