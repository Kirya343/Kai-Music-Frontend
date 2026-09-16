import { AudioChunk, TimeRange } from '@/lib/types';
import { useCallback, useRef, useState } from 'react';

const MIME = 'audio/mp4; codecs="mp4a.40.2"';

export const useAudioStream = () => {

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const [bufferedRanges, setBufferedRanges] = useState<TimeRange[] | null | null>(null);

    const queueRef = useRef<AudioChunk[]>([]);
    const nextExpectedSequenceRef = useRef<number>(0);

    const isInitializedRef = useRef<boolean>(false);
    const objectUrlRef = useRef<string | null>(null);

    const processQueue = useCallback(() => {

        const sourceBuffer = sourceBufferRef.current;

        if (!sourceBuffer) {
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
                nextExpectedSequenceRef.current++;
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

        const audio = new Audio();

        audio.autoplay = true;
        audio.controls = false;

        const mediaSource = new MediaSource();

        audio.src = URL.createObjectURL(mediaSource);

        audioRef.current = audio;
        mediaSourceRef.current = mediaSource;
        objectUrlRef.current = audio.src;

        mediaSource.addEventListener('sourceopen', () => {

            console.log('MediaSource opened');

            console.log(
                '2. MIME supported:',
                MediaSource.isTypeSupported(
                    'audio/mp4; codecs="mp4a.40.2"'
                )
            );

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

            processQueue();

            audio.play().catch(error => {
                console.error(
                    'Не удалось запустить audio:',
                    error
                );
            });
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

    const stopPlayback = useCallback(() => {

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

        queueRef.current = [];

        nextExpectedSequenceRef.current = 0;
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

    const resumePlayback = useCallback(() => {
        try {
            const audio = audioRef.current;

            if (audio) {
                audio.play();
            }
        } catch (e) {
            console.log(e)
        }
    }, [])

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

    return {
        handleAudioChunk,
        stopPlayback,
        pausePlayback,
        resumePlayback,
        audioRef,
        bufferedRanges
    };
};