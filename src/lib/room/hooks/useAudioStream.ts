import { AudioChunk } from '@audio';
import { useCallback, useRef } from 'react';
import { useMediaResource } from './stream/useMediaResource';

export const useAudioStream = () => {

    // очередь медиа чанков
    const queueRef = useRef<AudioChunk[]>([]);
    const processQueueRef = useRef<() => void>(() => {});

    // Sequence ожидаемого чанка текущего server stream.
    const nextExpectedSequenceRef = useRef<number | null>(null);
    const waitingForFirstChunkRef = useRef(false);

    const { 
        mediaSourceRef, audioRef, 
        cleanupAudio, initMediaSource,
        resumePlayback, pausePlayback,
        appendChunk, processInitializationChunk,
        sourceBufferRef, bufferedRanges,

        currentAudioId, paused, localPosition,
        updateLocalPlayback, setPaused, setLocalPosition,
        
        unsyncedPositionRef
    } = useMediaResource(processQueueRef);

    const processQueue = useCallback(() => {
        const sourceBuffer = sourceBufferRef.current;
        const mediaSource = mediaSourceRef.current;

        if (!sourceBuffer || !mediaSource) {
            return;
        }

        if (mediaSource.readyState !== 'open') {
            return;
        }

        if (sourceBuffer.updating) {
            return;
        }

        const index = queueRef.current.findIndex(
            chunk => !chunk.initialization
        );

        if (index === -1) {
            return;
        }

        const chunk = queueRef.current.splice(index, 1)[0];

        /*
        * Если это первый chunk после нового playbackState,
        * sequence предыдущей последовательности нас не интересует.
        */
        if (waitingForFirstChunkRef.current) {
            waitingForFirstChunkRef.current = false;

            console.log(
                'Первый chunk после playbackState:',
                chunk.sequence
            );
        } else {
            /** 
             * После первого chunk sequence должен продолжаться.
            */
            //console.log(" После первого chunk sequence должен продолжаться.")
            if (
                nextExpectedSequenceRef.current !== null &&
                chunk.sequence !== nextExpectedSequenceRef.current
            ) {
                console.log(
                    'Ожидаем sequence:',
                    nextExpectedSequenceRef.current,
                    'но получили:',
                    chunk.sequence
                );

                queueRef.current.unshift(chunk);
                return;
            }
        }

        if (appendChunk(chunk)) {

            console.log('Добавляем media chunk:', chunk.sequence);

            nextExpectedSequenceRef.current = chunk.sequence + 1;
        } else {
            console.error(`Ошибка добавления M4A чанка #${chunk.sequence}:`);

            queueRef.current.unshift(chunk);
        }
    }, [appendChunk]);

    processQueueRef.current = processQueue;

    /*
     * Вызывается при получении нового playbackState.
     *
     * Это ВАЖНАЯ часть.
     *
     * playbackState означает начало нового server stream.
     */
    const startNewStream = useCallback(() => {

        /*
         * Старые ещё не обработанные chunks больше не нужны.
         */
        queueRef.current = [];

        /*
         * Sequence нового stream не обязан продолжать старый.
         */
        nextExpectedSequenceRef.current = null;
    }, []);

    const startNewPlaybackStream = useCallback(() => {
        queueRef.current = [];

        nextExpectedSequenceRef.current = null;
        waitingForFirstChunkRef.current = true;
    }, []);

    const handleInitializationChunk = useCallback(
        (chunk: AudioChunk) => {
            console.log("Получен initialization chunk, начинаем новый media resource");

            startNewStream();

            cleanupAudio();

            initMediaSource();

            processInitializationChunk(chunk);
        },
        [
            startNewStream,
            cleanupAudio,
            initMediaSource,
            processInitializationChunk
        ]
    );

    /*
     * Вызывается на каждый chunk от backend.
     */
    const handleAudioChunk = useCallback(
        (chunk: AudioChunk) => {
            console.log(`Получен ${chunk.initialization ? "init" : "media"} chunk: ${chunk.sequence}`);

            if (chunk.initialization) {
                handleInitializationChunk(chunk);
                return;
            }

            queueRef.current.push(chunk);
            processQueue();
        },
        [handleInitializationChunk, processQueue]
    );

    return {
        handleAudioChunk,
        startNewStream,
        pausePlayback,
        resumePlayback,
        audioRef,
        bufferedRanges,
        startNewPlaybackStream,

        currentAudioId, paused, localPosition,
        updateLocalPlayback, setPaused, setLocalPosition,

        unsyncedPositionRef
    };
};