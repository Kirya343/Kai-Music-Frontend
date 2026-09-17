import { AudioChunk, TimeRange } from '@/lib/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useAudioStream = () => {

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const streamGenerationRef = useRef(0);
    const [bufferedRanges, setBufferedRanges] = useState<TimeRange[] | null | null>(null);

    const queueRef = useRef<AudioChunk[]>([]);
    const nextExpectedSequenceRef = useRef<number | null>(null);

    const isInitializedRef = useRef<boolean>(false);
    const objectUrlRef = useRef<string | null>(null);

    const processQueue = useCallback(() => {
        const sourceBuffer = sourceBufferRef.current;
        const mediaSource = mediaSourceRef.current;

        if (!sourceBuffer || !mediaSource) {
            return;
        }

        if (mediaSource.readyState !== "open") {
            return;
        }

        if (sourceBuffer.updating) {
            return;
        }

        queueRef.current.sort((a, b) => {
            if (a.initialization) {
                return -1;
            }

            if (b.initialization) {
                return 1;
            }

            return a.sequence - b.sequence;
        });

        const nextIndex = queueRef.current.findIndex(chunk => {
            if (chunk.initialization) {
                return !isInitializedRef.current;
            }

            if (nextExpectedSequenceRef.current === null) {
                return true;
            }

            return chunk.sequence === nextExpectedSequenceRef.current;
        });

        if (nextIndex === -1) {
            return;
        }

        const chunk = queueRef.current.splice(nextIndex, 1)[0];

        try {
            const buffer = chunk.bytes.buffer.slice(
                chunk.bytes.byteOffset,
                chunk.bytes.byteOffset + chunk.bytes.byteLength
            ) as ArrayBuffer;

            sourceBuffer.appendBuffer(buffer);

            if (chunk.initialization) {
                isInitializedRef.current = true;
            } else {
                nextExpectedSequenceRef.current = chunk.sequence + 1;
            }
        } catch (error) {
            console.error(
                `Ошибка добавления M4A чанка #${chunk.sequence}:`,
                error
            );

            queueRef.current.unshift(chunk);
        }
    }, []);

    const initMediaSource = useCallback(() => {

        if (mediaSourceRef.current) {
            return;
        }

        const generation = ++streamGenerationRef.current;

        const audio = new Audio();

        audio.autoplay = true;
        audio.controls = false;

        const mediaSource = new MediaSource();

        audio.src = URL.createObjectURL(mediaSource);

        audioRef.current = audio;
        mediaSourceRef.current = mediaSource;
        objectUrlRef.current = audio.src;

        mediaSource.addEventListener('sourceopen', () => {

            console.log('sourceopen', {
                generation,
                currentGeneration: streamGenerationRef.current
            });


            if (generation !== streamGenerationRef.current) {
                return;
            }

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
                processQueue()
            });

            sourceBuffer.addEventListener('error', (event) => {
                console.error('SourceBuffer error:', event);
            });

            mediaSource.addEventListener('error', (event) => {
                console.error('MediaSource error:', event);
            });

            processQueue();

            /* audio.play().catch(error => {
                console.error(
                    'Не удалось запустить audio:',
                    error
                );
            }); */
        });

    }, [processQueue]);

    const handleAudioChunk = useCallback(
        (chunk: AudioChunk) => {

            console.log(
                'Пришёл M4A чанк:',
                chunk.sequence,
                'initialization:',
                chunk.initialization,
                'bytes:',
                chunk.bytes.byteLength
            );

            initMediaSource();

            queueRef.current.push(chunk);

            processQueue();
        },
        [initMediaSource, processQueue]
    );

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

    }, []);

    const pausePlayback = useCallback(() => {

        try {
            const audio = audioRef.current;

            if (audio) {
                audio.pause();
            }
        } catch (e) {
            console.log(e)
        }
    }, [])

    const resumePlayback = useCallback(async () => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        try {
            await audio.play();
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }

            console.error("Ошибка запуска audio:", error);
        }
    }, []);

    const updateBufferedRanges = () => {
        const sourceBuffer = sourceBufferRef.current;

        if (!sourceBuffer) {
            return;
        }

        const ranges = [];

        for (let i = 0; i < sourceBuffer.buffered.length; i++) {
            ranges.push({
                start: sourceBuffer.buffered.start(i),
                end: sourceBuffer.buffered.end(i)
            });
        }

        setBufferedRanges(ranges);
    };

    useEffect(() => {
        console.log("bufferedRanges", bufferedRanges)
    }, [bufferedRanges])

    return {
        handleAudioChunk,
        cleanupAudio,
        pausePlayback,
        resumePlayback,
        audioRef,
        bufferedRanges,
        setBufferedRanges
    };
};