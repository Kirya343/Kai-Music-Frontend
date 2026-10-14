import clsx from "clsx";
import styles from "./SearchInput.module.scss"

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    foundCount?: number;
}

/**
 * Component for universal search-input for SearchLauout or any page where search is needed
 */
export const SearchInput = ({
    value,
    onChange,
    className,
    foundCount
}: SearchInputProps) => {
    return (
        <div className={styles.wrapper}>
            <input
                type="search"
                value={value}
                onChange={event => onChange(event.target.value)}
                placeholder="Search..."
                className={clsx(className, styles.searchInput)}
            />

            <span className={styles.foundCount}>Found {foundCount}</span>
        </div>
    );
};