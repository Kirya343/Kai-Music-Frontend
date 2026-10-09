import { ReactNode } from "react";
import styles from "./Loader.module.scss";
import { LoadingSpinnerIcon } from "@/assets/icons";

/**
 * Loader is a wrapper conponent to show the loading when content while content inside 
 * should not be rendered,
 * controls by boolean param
 * 
 * @param loadingActive is param to control loading
 * @param children is content to display when loading is done
 */
const Loader = ({
    loadingActive,
    children
}: {
    loadingActive: boolean;
    children: ReactNode;
}) => {

    return loadingActive ? (
        <div className={styles.wrapper}>
            <div className="loader">
                <LoadingSpinnerIcon/>
            </div>
        </div>
    ) : children;
};

export default Loader;