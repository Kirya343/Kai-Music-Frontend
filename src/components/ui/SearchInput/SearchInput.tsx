import clsx from "clsx";
import styles from "./SearchInput.module.scss"

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/**
 * Component for universal search-input for SearchLauout or any page where search is needed
 * 
 * @param param0 
 * @returns 
 */
export const SearchInput = ({
    value,
    onChange,
    className
}: SearchInputProps) => {
    return (
        <input
            type="search"
            value={value}
            onChange={event => onChange(event.target.value)}
            placeholder="Search..."
            className={clsx(className, styles.searchInput)}
        />
    );
};