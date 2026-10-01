import { audioService } from "@audio/audioService";
import { IAudio } from "@audio/audioTypes";
import { AxiosProgressEvent } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

interface IUploadingAudio {
    file: File;
    progress: number;
    id: string;
    success?: boolean
}

export const useLibrary = () => {

    const [audios, setAudios] = useState<IAudio[]>(() => {
        const saved = localStorage.getItem("libraryAudios");

        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [uploading, setUploading] = useState<IUploadingAudio[]>([]);

    const [visibleCount, setVisibleCount] = useState(50);

    const filteredAudios = useMemo<IAudio[]>(() => {
        if (!audios) {
            return [];
        }

        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return audios.slice().sort((a, b) => b.id - a.id);
        }

        return audios.filter(audio =>
            [
                audio.id,
                audio.name,
                audio.format,
                audio.title,
                audio.artist,
                audio.album,
                audio.duration,
                audio.coverUrl,
            ].some(value =>
                String(value).toLowerCase().includes(query)
            )
        );
    }, [audios, searchQuery]);

    const visibleAudios = useMemo(() => {
        return filteredAudios.slice(0, visibleCount);
    }, [filteredAudios, visibleCount]);

    const syncLibrary = useCallback(async () => {
        try {
            const data = await audioService.loadLibrary();
            setAudios(data)
        } finally {
            setLoading(false)
        }
    }, [])

    const deleteAudio = useCallback(async (audio: IAudio) => {
        const success = confirm(`Ary you sure deleting audio ${audio.name}`)

        if (success) {
            try {
                await audioService.deleteAudio(audio.id)
                setAudios(prev => prev?.filter(a => a.id !== audio.id) || []);
            } catch (e) {
                console.error(e)
            }
        }
    }, [setAudios])

    const updateAudio = useCallback((audio: IAudio) => {
        setAudios(prev =>
            prev?.map(item =>
                item.id === audio.id
                    ? audio
                    : item
            ) ?? ([audio])
        );
    }, [setAudios])

    const uploadAudios = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files) return;

        const fileList = Array.from(files);

        let identifiedList: { id: string, file: File}[] = [];

        for (const file of fileList) {
            const uploadId = `${file.name}-${Date.now()}`;

            setUploading(prev => [
                ...prev,
                {
                    id: uploadId,
                    file,
                    progress: 0
                }
            ]);

            identifiedList.push({id: uploadId, file})
        }

        for (const fileItem of identifiedList) {

            const file = fileItem.file;

            const formData = new FormData();
            formData.append("file", file);

            try {
                await audioService.upload(formData, (progressEvent: AxiosProgressEvent) => {
                    if (!progressEvent.total) return;

                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );

                    setUploading(prev =>
                        prev.map(item =>
                            item.id === fileItem.id
                                ? {
                                    ...item,
                                    progress: percent,
                                    success: percent >= 100 ? true : undefined
                                }
                                : item
                        )
                    );
                });
            } catch (error) {
                setUploading(prev =>
                    prev.map(item =>
                        item.id === fileItem.id
                            ? { ...item, success: false }
                            : item
                    )
                );
            }
        }

        syncLibrary();
    };

    useEffect(() => {
        if (audios) localStorage.setItem("libraryAudios", JSON.stringify(audios));
    }, [audios]);

    useEffect(() => {
        setVisibleCount(50);
    }, [searchQuery]);

    useEffect(() => {
        syncLibrary()
    }, []);

    return { 
        visibleAudios, setAudios, 
        deleteAudio, updateAudio, 
        loading, setSearchQuery,
        searchQuery, uploadAudios,
        uploading, filteredAudios,
        visibleCount, setVisibleCount
    };
}