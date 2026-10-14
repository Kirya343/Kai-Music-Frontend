import { IAudio, audioService } from "@audio";
import { useData, useSearch } from "@common";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AxiosProgressEvent } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface IUploadingAudio {
    file: File;
    progress: number;
    id: string;
    success?: boolean
}

/**
 * Controls data for audio library
 * 
 * Creates voids and states
 * 
 * @returns data to view the library tracks and voids to filter the list
 */
export const useLibrary = () => {

    const { audios } = useData();
    
    /** List of current uploads */
    const [uploading, setUploading] = useState<IUploadingAudio[]>([]);

    /** 
     * HTML element reference. 
     * Should be placed on the element, that can be scrolled to contain the tracks list 
     */
    const parentRef = useRef<HTMLDivElement>(null);

    /** Count of visibple items on page */
    const [visibleCount, setVisibleCount] = useState(50);

    const { filteredList, searchQuery, setSearchQuery } = useSearch(audios.data);

    /** Audios that should be currently visible */
    const visibleAudios = useMemo(() => {
        return filteredList.slice(0, visibleCount);
    }, [filteredList, visibleCount]);

    /** Uploads audios on server */
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
    };

    /** ReactVirtualizer optimizes the tracks list */
    const rowVirtualizer = useVirtualizer({
        count: visibleAudios.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80,
        overscan: 10,

        onChange: (instance, sync) => {
            if (!sync) {
                return;
            }

            const items = instance.getVirtualItems();

            if (!items.length) {
                return;
            }

            const lastItem = items[items.length - 1];

            if (
                lastItem.index >= visibleAudios.length - 10 &&
                visibleCount < filteredList.length
            ) {
                setVisibleCount(count =>
                    Math.min(
                        count + 50,
                        filteredList.length
                    )
                );
            }
        },
    });

    useEffect(() => {
        setVisibleCount(50);
    }, [searchQuery]);

    return { 
        visibleAudios, setSearchQuery,
        searchQuery, uploadAudios,
        uploading, rowVirtualizer,
        parentRef, filteredList
    };
}