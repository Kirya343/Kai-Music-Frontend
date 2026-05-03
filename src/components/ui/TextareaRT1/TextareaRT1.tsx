
import { autoGrow } from "@/lib/services/utils/htmlViewService";
import styles from "./TextareaRT1.module.scss";

const TextareaRT1 = ({
    value,
    setValue,
    className = "",
    placeholder = "",
    disabled,
    onKeyDown
}: {
    value: string;
    setValue: (value: string) => void;
    className?: string;
    placeholder: string;
    disabled?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) => {

    return (
        <textarea 
            className={`${styles.rt1} ${className ? className : ""}`}
            value={value}
            onChange={(e) => {
                setValue(e.target.value)
                autoGrow(e)
            }}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={onKeyDown}
        />
    );
}

export default TextareaRT1;