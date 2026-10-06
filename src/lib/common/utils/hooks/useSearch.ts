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

        const containsQuery = (value: unknown): boolean => {
            if (value === null || value === undefined) {
                return false;
            }

            if (typeof value === "object") {
                return Object.values(value).some(containsQuery);
            }

            return String(value).toLowerCase().includes(query);
        };

        return list.filter(item => containsQuery(item));
    }, [list, searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        filteredList
    }
}