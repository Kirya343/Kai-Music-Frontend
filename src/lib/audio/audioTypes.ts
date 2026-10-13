
/**
 * Represents an audio chunk encoded in fragmented MP4 (fMP4).
 */
export interface AudioChunk {

    /** Audio data of the chunk. */
    bytes: Uint8Array;

    /** Sequence number of the chunk. */
    sequence: number;

    /** Duration of the audio chunk in seconds. */
    duration: number;

    /** Indicates whether this is an initialization chunk. */
    initialization: boolean;

    /** ID of the queue entry associated with this chunk. */
    entryId: number;
};

/**
 * Represents time ranges
 */
export interface TimeRange {

    /** Time range start time */
    start: number; 

    /** Time range end time */
    end: number
}

/**
 * Represents audio file metadata.
 */
export interface IAudio {
    /** Unique identifier of the audio file. */
    id: number;

    /** Original name of the audio file. */
    name: string;

    /** Audio file format (e.g., mp3, m4a, flac). */
    format: string;

    /** Title of the audio track. */
    title: string;

    /** Name of the artist. */
    artist: string;

    /** Name of the album. */
    album: string;

    /** Duration of the audio track in seconds. */
    duration: number;

    /** URL of the album cover image. */
    coverUrl: string;
}

/**
 * Represents the audio metadata fields that can be updated.
 */
export interface IAudioUpdate {
    /** Updated title of the audio track. */
    title: string;

    /** Updated name of the artist. */
    artist: string;

    /** Updated name of the album. */
    album: string;

    /** Updated URL of the album cover image. */
    coverUrl: string;
}
