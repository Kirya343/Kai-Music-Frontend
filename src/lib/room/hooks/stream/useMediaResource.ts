import { useCallback, useRef, useState } from "react";
import { useAudioBuffer } from "./useAudioBuffer";
import { IPlaybackState } from "@room/roomTypes";

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

    // audio state
    const [paused, setPaused] = useState(true);
    const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
    const [localPosition, setLocalPosition] = useState<number>(0);

    const unsyncedStateRef = useRef<IPlaybackState | null>(null);

    const initMediaSource = useCallback(() => {
        if (mediaSourceRef.current) {
            return;
        }

        const audio = new Audio();
        const mediaSource = new MediaSource();

        audio.autoplay = false;
        audio.controls = false;

        const objectUrl = URL.createObjectURL(mediaSource);

        audio.src = objectUrl;
        const saved = localStorage.getItem("audioVolume");
        audio.volume = saved ? Number(saved) : 1;

        audioRef.current = audio;
        mediaSourceRef.current = mediaSource;
        objectUrlRef.current = objectUrl;

        mediaSource.addEventListener('sourceopen', () => {
            console.log('MediaSource opened');

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
                    console.log(
                        'SourceBuffer error:',
                        event
                    );
                });
            }

            mediaSource.addEventListener('error', event => {
                console.log(
                    'MediaSource error:',
                    event
                );
            });

            processInitializationChunk();
        });

        addEventListener();
    }, [updateBufferedRanges]);

    const cleanupAudio = useCallback(() => {
        console.log("Очищаем playback")

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

            console.log(
                'Ошибка запуска audio:',
                error
            );
        }
    }, []);

    const updateLocalPlayback = useCallback((playbackState: IPlaybackState) => {

        console.log("устанавливаем setLocalPosition на playbackState.position")

        setCurrentEntryId(playbackState.entryId);
        setLocalPosition(playbackState.position);
        setPaused(playbackState.pause);
    }, [])

    // События пользователя
    const addEventListener = useCallback(() => {
        const audio = audioRef.current;

        if (!audio) return;

        const handleTimeUpdate = () => {
            if (unsyncedStateRef.current !== null) {
                console.log("unsyncedStateRef.current", unsyncedStateRef.current)
                return;
            }
            setLocalPosition(audio.currentTime);
        }
        audio.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [setLocalPosition]);

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
        bufferedRanges,

        currentEntryId, paused, localPosition,
        updateLocalPlayback, setPaused, setLocalPosition,

        unsyncedStateRef
    }
}