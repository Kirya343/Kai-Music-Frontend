import { AudioChunk, TimeRange } from '@/lib/types';
import { useCallback, useRef, useState } from 'react';

export const useAudioStream = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const waitingForFirstChunkRef = useRef(false);

    const [bufferedRanges, setBufferedRanges] = useState<TimeRange[] | null>(null);

    const queueRef = useRef<AudioChunk[]>([]);

    // Sequence ожидаемого чанка текущего server stream.
    const nextExpectedSequenceRef = useRef<number | null>(null);

    // Был ли уже добавлен initialization chunk текущего stream.
    const isInitializedRef = useRef(false);

    // Увеличивается при каждом новом playbackState/seek.
    const streamGenerationRef = useRef(0);

    const objectUrlRef = useRef<string | null>(null);

    const updateBufferedRanges = useCallback(() => {
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

        setBufferedRanges(ranges);

        console.log(
            'MSE buffered:',
            ranges
        );
    }, []);

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

        if (queueRef.current.length === 0) {
            return;
        }

        /*
        * Initialization добавляется только один раз
        * за время жизни MediaSource.
        */
        if (!isInitializedRef.current) {
            const index = queueRef.current.findIndex(
                chunk => chunk.initialization
            );

            if (index === -1) {
                return;
            }

            const chunk = queueRef.current.splice(index, 1)[0];

            try {
                const buffer = chunk.bytes.buffer.slice(
                    chunk.bytes.byteOffset,
                    chunk.bytes.byteOffset + chunk.bytes.byteLength
                ) as ArrayBuffer;

                console.log(
                    'Добавляем initialization chunk'
                );

                sourceBuffer.appendBuffer(buffer);

                isInitializedRef.current = true;
            } catch (error) {
                console.error(
                    'Ошибка добавления initialization chunk:',
                    error
                );

                queueRef.current.unshift(chunk);
            }

            return;
        }

        /*
        * Ищем media chunk.
        */
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
            /*
            * После первого chunk sequence должен продолжаться.
            */
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

        try {
            const buffer = chunk.bytes.buffer.slice(
                chunk.bytes.byteOffset,
                chunk.bytes.byteOffset + chunk.bytes.byteLength
            ) as ArrayBuffer;

            console.log(
                'Добавляем media chunk:',
                chunk.sequence,
                'expected:',
                nextExpectedSequenceRef.current
            );

            sourceBuffer.appendBuffer(buffer);

            nextExpectedSequenceRef.current = chunk.sequence + 1;
        } catch (error) {
            console.error(
                `Ошибка добавления M4A чанка #${chunk.sequence}:`,
                error
            );

            queueRef.current.unshift(chunk);
        }
    }, []);

    const startNewPlaybackStream = useCallback(() => {
        queueRef.current = [];

        nextExpectedSequenceRef.current = null;
        waitingForFirstChunkRef.current = true;
    }, []);

    const initMediaSource = useCallback(() => {
        if (mediaSourceRef.current) {
            return;
        }

        const audio = new Audio();
        const mediaSource = new MediaSource();

        audio.autoplay = true;
        audio.controls = false;

        const objectUrl = URL.createObjectURL(mediaSource);

        audio.src = objectUrl;

        audioRef.current = audio;
        mediaSourceRef.current = mediaSource;
        objectUrlRef.current = objectUrl;

        mediaSource.addEventListener('sourceopen', () => {
            console.log('MediaSource opened');

            if (sourceBufferRef.current) {
                return;
            }

            const sourceBuffer = mediaSource.addSourceBuffer(
                'audio/mp4; codecs="mp4a.40.2"'
            );

            sourceBufferRef.current = sourceBuffer;

            sourceBuffer.addEventListener('updateend', () => {
                updateBufferedRanges();
                processQueue();
            });

            sourceBuffer.addEventListener('error', event => {
                console.error(
                    'SourceBuffer error:',
                    event
                );
            });

            mediaSource.addEventListener('error', event => {
                console.error(
                    'MediaSource error:',
                    event
                );
            });

            processQueue();
        });
    }, [processQueue, updateBufferedRanges]);

    /*
     * Вызывается на каждый chunk от backend.
     */
    const handleAudioChunk = useCallback(
        (chunk: AudioChunk) => {
            console.log(
                'Получен chunk:',
                {
                    sequence: chunk.sequence,
                    initialization: chunk.initialization
                }
            );

            initMediaSource();

            queueRef.current.push(chunk);

            processQueue();
        },
        [initMediaSource, processQueue]
    );

    /*
     * Вызывается при получении нового playbackState.
     *
     * Это ВАЖНАЯ часть.
     *
     * playbackState означает начало нового server stream.
     */
    const startNewStream = useCallback(() => {
        streamGenerationRef.current++;

        console.log(
            'Начинаем новый audio stream:',
            streamGenerationRef.current
        );

        /*
         * Старые ещё не обработанные chunks больше не нужны.
         */
        queueRef.current = [];

        /*
         * Следующий chunk будет initialization.
         */
        isInitializedRef.current = false;

        /*
         * Sequence нового stream не обязан продолжать старый.
         */
        nextExpectedSequenceRef.current = null;
    }, []);

    const cleanupAudio = useCallback(() => {
        const audio = audioRef.current;

        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        }

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }

        audioRef.current = null;
        mediaSourceRef.current = null;
        sourceBufferRef.current = null;
        objectUrlRef.current = null;

        setBufferedRanges(null);

        queueRef.current = [];
        nextExpectedSequenceRef.current = null;
        isInitializedRef.current = false;

        streamGenerationRef.current++;
    }, []);

    const pausePlayback = useCallback(() => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        audio.pause();
    }, []);

    const resumePlayback = useCallback(async () => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        try {
            await audio.play();
        } catch (error) {
            if (
                error instanceof DOMException &&
                error.name === 'AbortError'
            ) {
                return;
            }

            console.error(
                'Ошибка запуска audio:',
                error
            );
        }
    }, []);

    return {
        handleAudioChunk,
        startNewStream,
        cleanupAudio,
        pausePlayback,
        resumePlayback,
        audioRef,
        bufferedRanges,
        setBufferedRanges,
        startNewPlaybackStream
    };
};