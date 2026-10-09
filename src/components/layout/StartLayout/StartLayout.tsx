import { Outlet } from "react-router-dom";
import styles from "./StartLayout.module.scss"
import { useGlobal } from "@common";
import clsx from "clsx";

/**
 * StartLayout if layout that controls application starting
 */
const StartLayout = () => {

    const { started, setStarted } = useGlobal();

    /**
     * starting timeot to keep smooth appenrance
     */
    const start = () => {
        setTimeout(() => {
            setStarted(true);
        }, 600);
    };

    start();

    return (
        <div className={clsx(styles.layout, started && styles.started)}>
            {started && (
                <div className={styles.content}>
                    <Outlet />
                </div>
            )}
        </div>
    )
}

export default StartLayout;