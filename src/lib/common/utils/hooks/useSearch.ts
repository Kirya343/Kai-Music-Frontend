import { useMemo, useState } from "react";

/**
 * Provides search and filtering functionality for a list of objects.
 *
 * Searches recursively through object values and sorts the list by ID
 * in descending order when the search query is empty.
 *
 * @param list - List of objects to filter. Each object must have a numeric ID.
 * @returns The search query, its state setter, and the filtered list.
 */
export const useSearch = <T extends { id: number }>(list: T[]) => {

    /** Search query to filter the items list */
    const [searchQuery, setSearchQuery] = useState<string>("")

    /** Filtered items-list by search query */
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