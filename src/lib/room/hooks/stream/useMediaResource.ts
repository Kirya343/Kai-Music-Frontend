import { useCallback, useRef } from "react";
import { useAudioBuffer } from "./useAudioBuffer";
import debug from "debug"

const log = debug("room:audio")

export const useMediaResource = (processQueueRef: React.RefObject<() => void>) => {

    const { 
        sourceBufferRef, updateBufferedRanges, 
        processInitializationChunk, setBufferedRanges,
        bufferedRanges, appendChunk,
        resetBuffer
    } = useAudioBuffer();

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(null);
    const objectUrlRef = useRef<string | null>(null);

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
            log('MediaSource opened');

            if (!sourceBufferRef.current) {
                const sourceBuffer = mediaSource.addSourceBuffer(
                    'audio/mp4; codecs="mp4a.40.2"'
                );

                sourceBufferRef.current = sourceBuffer;

                sourceBuffer.addEventListener('updateend', () => {
                    updateBufferedRanges();
                    processQueueRef.current();
                });

                sourceBuffer.addEventListener('error', event => {
                    log(
                        'SourceBuffer error:',
                        event
                    );
                });
            }

            mediaSource.addEventListener('error', event => {
                log(
                    'MediaSource error:',
                    event
                );
            });

            processInitializationChunk();
        });
    }, [updateBufferedRanges]);

    const cleanupAudio = useCallback(() => {
        log("Очищаем playback")

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
        objectUrlRef.current = null;

        resetBuffer();

        //streamGenerationRef.current++;
    }, [setBufferedRanges]);

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

            log(
                'Ошибка запуска audio:',
                error
            );
        }
    }, []);

    return {
        audioRef,
        mediaSourceRef,
        initMediaSource,
        cleanupAudio,
        pausePlayback,
        resumePlayback,
        appendChunk,
        processInitializationChunk,
        sourceBufferRef, 
        bufferedRanges
    }
}