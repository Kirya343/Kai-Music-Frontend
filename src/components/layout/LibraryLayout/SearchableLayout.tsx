import styles from "./SearchableLayout.module.scss"
import PageLayout from "../PageLayout/PageLayout";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";

interface SearchableLayoutProps<T extends { id: number }> {
    title: string,
    extraActions: ReactNode[],
    search: {
        searchQuery: string;
        setSearchQuery: Dispatch<SetStateAction<string>>;
        filteredList: T[];
    },
    children: ReactNode
}

/**
 * SearchableLayout if layout for pages where is filterable list of cards
 * 
 * @param title is page title
 * @param extraActions are buttons that placed near the search-input
 * @param search is data of search and methods to update filters
 * @param children is main content of page
 */
const SearchableLayout = <T extends { id: number }>({
    title,
    extraActions,
    search,
    children
}: SearchableLayoutProps<T>) => {

    return (
        <PageLayout title={title}>
            <div className={styles.sorting}>

                <div className={styles.row}>
                    {extraActions}

                    <SearchInput value={search.searchQuery} onChange={(value) => search.setSearchQuery(value)}/>
                </div>

                {search.searchQuery.length != 0 && <span>Found {search.filteredList.length} audios</span>}
            </div>

            {children}
        </PageLayout>
    );
}

export default SearchableLayout;