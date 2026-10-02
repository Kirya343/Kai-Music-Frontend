import { useMemo, useState } from "react";

export const useSearch = <T extends { id: number }>(list: T[]) => {

    const [searchQuery, setSearchQuery] = useState<string>("")

    const filteredList = useMemo<T[]>(() => {
        if (!list) {
            return [];
        }

        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return list.slice().sort((a, b) => b.id - a.id);
        }

        return list.filter(playlist =>
            Object.values(playlist)
                .filter(value => value === null || typeof value !== "object")
                .some(value =>
                    String(value).toLowerCase().includes(query.toLowerCase())
                )
        );
    }, [list, searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        filteredList
    }
}