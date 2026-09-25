import { AudioChunk, TimeRange } from "@audio";
import { useCallback, useRef, useState } from "react";

export function useAudioBuffer() {

    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const isInitializedRef = useRef(false);
    const initializedChunkRef = useRef<AudioChunk | null>(null)
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

    const appendChunk = useCallback((chunk: AudioChunk) => {
        const sourceBuffer = sourceBufferRef.current;

        if (!sourceBuffer || sourceBuffer.updating) {
            return false;
        }

        const buffer = chunk.bytes.buffer.slice(
            chunk.bytes.byteOffset,
            chunk.bytes.byteOffset + chunk.bytes.byteLength
        ) as ArrayBuffer;

        sourceBuffer.appendBuffer(buffer);

        return true;
    }, []);

    const processInitializationChunk = useCallback((optionalChunk?: AudioChunk) => {
        const sourceBuffer = sourceBufferRef.current;

        let chunk = null;

        if (optionalChunk) {
            initializedChunkRef.current = optionalChunk
            chunk = optionalChunk
        } else {
            chunk = initializedChunkRef.current
        }

        if (!sourceBuffer || !chunk) {
            return;
        }

        if (sourceBuffer.updating) {
            return;
        }

        const success = appendChunk(chunk)

        if (success) {

            isInitializedRef.current = true;

            console.log("Initialization chunk добавлен");
        } else {
            console.error("Ошибка добавления initialization chunk");
        }
    }, [appendChunk]);

    const resetBuffer = useCallback(() => {
        sourceBufferRef.current = null;
        initializedChunkRef.current = null;
        isInitializedRef.current = false;
        setBufferedRanges(new Map());
    }, []);

    return {
        updateBufferedRanges, setBufferUpdateHandler,
        bufferedRanges, onBufferUpdateRef,
        sourceBufferRef,
        appendChunk,
        processInitializationChunk,
        setBufferedRanges,
        resetBuffer
    }
}