import { AudioChunk } from '@audio';
import { useCallback, useRef } from 'react';
import { useMediaSource } from './stream/useMediaSource';

export const useAudioStream = () => {

    // очередь медиа чанков
    const queueRef = useRef<AudioChunk[]>([]);

    const { 
        mediaSourceRef, audioRef, 
        cleanupAudio, initMediaSource,
        resumePlayback, pausePlayback,
        appendChunks, 
        sourceBufferRef, bufferedRanges,
        currentEntryIdRef,

        playbackState, setPlaybackState,
        
        unsyncedStateRef
    } = useMediaSource();

    const processQueue = useCallback((entryId: number) => {

        const sourceBuffer = sourceBufferRef.current;
        const mediaSource = mediaSourceRef.current;

        if (!sourceBuffer || !mediaSource) {
            return;
        }

        if (
            mediaSource.readyState !== 'open' ||
            sourceBuffer.updating
        ) {
            return;
        }

        const chunks = queueRef.current
            .filter(chunk => chunk.entryId === entryId);

        const initializationChunk = chunks.find(
            chunk => chunk.initialization
        );

        if (!initializationChunk) {
            return;
        }

        const mediaChunks = chunks
            .filter(chunk => !chunk.initialization)
            .sort((a, b) => a.sequence - b.sequence);

        if (mediaChunks.length === 0) {
            return;
        }

        const chunksToAppend: AudioChunk[] = [
            initializationChunk
        ];
        
        for (const chunk of mediaChunks) {
            chunksToAppend.push(chunk);
        }

        if (chunksToAppend.length === 1) {
            return;
        }

        if (!appendChunks(chunksToAppend)) {
            return;
        }

        console.log(
            'Добавлен buffer:',
            chunksToAppend.map(chunk =>
                chunk.initialization
                    ? 'init'
                    : chunk.sequence
            )
        );
    }, [appendChunks]);

    const startNewAudio = useCallback((entryId: number) => {
        console.log("Начинаем новый media resource");

        cleanupAudio();
        initMediaSource(entryId);
    }, [cleanupAudio, initMediaSource]);

    /*
     * Вызывается на каждый chunk от backend.
     */
    const handleAudioChunk = useCallback((chunk: AudioChunk) => {
        console.log(`Получен ${chunk.initialization ? "init" : "media"} chunk: ${chunk.sequence}`);

        queueRef.current.push(chunk);

        const entryId = currentEntryIdRef.current;

        if (entryId) processQueue(entryId);
    }, [processQueue]);

    return {
        handleAudioChunk,
        startNewAudio,
        pausePlayback,
        resumePlayback,
        audioRef,
        bufferedRanges,

        playbackState, setPlaybackState,

        unsyncedStateRef
    };
};