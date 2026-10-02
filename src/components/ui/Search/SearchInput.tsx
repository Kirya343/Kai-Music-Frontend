import clsx from "clsx";
import styles from "./Search.module.scss"

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

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