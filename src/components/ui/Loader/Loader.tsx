import { ReactNode } from "react";
import styles from "./Loader.module.scss";
import { LoadingSpinnerIcon } from "@/assets/icons";

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