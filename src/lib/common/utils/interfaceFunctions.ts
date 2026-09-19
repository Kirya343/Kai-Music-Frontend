export function countPosition(position: number) {
    return `${Math.floor(position / 60)}:${Math.floor(position % 60).toString().padStart(2, '0')}`
}