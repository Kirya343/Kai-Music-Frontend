import { AudioChunk, TimeRange } from "@audio";
import { useCallback, useRef, useState } from "react";

export function useAudioBuffer() {

    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const [bufferedRanges, setBufferedRanges] = useState<Map<number, TimeRange[]>>(new Map());
    const onBufferUpdateRef = useRef<((entryId: number) => void) | null>(null);

    const setBufferUpdateHandler = useCallback(
        (callback: (entryId: number) => void) => {
            onBufferUpdateRef.current = callback;
        }, []);

    const updateBufferedRanges = useCallback((entryId: number) => {
        const sourceBuffer = sourceBufferRef.current;

        if (!sourceBuffer) {
            return;
        }

        const ranges: TimeRange[] = [];

        for (let i = 0; i < sourceBuffer.buffered.length; i++) {
            ranges.push({
                start: sourceBuffer.buffered.start(i),
                end: sourceBuffer.buffered.end(i)
            });
        }

        const updated = bufferedRanges.set(entryId, ranges);

        console.log("buffer", updated)

        setBufferedRanges(updated);

        onBufferUpdateRef.current?.(entryId)
    }, [bufferedRanges]);

    const appendChunks = useCallback((chunks: AudioChunk[]) => {
        const sourceBuffer = sourceBufferRef.current;

        if (!sourceBuffer || sourceBuffer.updating || chunks.length === 0) {
            return false;
        }

        const totalSize = chunks.reduce(
            (size, chunk) => size + chunk.bytes.byteLength,
            0
        );

        const buffer = new Uint8Array(totalSize);

        let offset = 0;

        for (const chunk of chunks) {
            buffer.set(chunk.bytes, offset);
            offset += chunk.bytes.byteLength;
        }

        sourceBuffer.appendBuffer(buffer);

        return true;
    }, []);

    const resetBuffer = useCallback(() => {
        sourceBufferRef.current = null;
        setBufferedRanges(new Map());
    }, []);

    return {
        updateBufferedRanges, setBufferUpdateHandler,
        bufferedRanges, onBufferUpdateRef,
        sourceBufferRef,
        appendChunks,
        setBufferedRanges,
        resetBuffer
    }
}