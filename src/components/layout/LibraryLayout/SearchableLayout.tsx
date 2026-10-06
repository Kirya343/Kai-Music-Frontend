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