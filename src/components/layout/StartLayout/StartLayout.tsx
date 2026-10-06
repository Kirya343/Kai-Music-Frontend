import { Outlet } from "react-router-dom";
import styles from "./StartLayout.module.scss"
import { useGlobal } from "@common";
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx";

const StartLayout = () => {

    const { started, setStarted } = useGlobal();

    const start = () => {
        setTimeout(() => {
            setStarted(true);
        }, 600);
    };

    start()

    return (
        <div className={clsx(styles.layout, started && styles.started)}>
            <AnimatePresence>

                {started && (
                    <div className={styles.content}>
                        <Outlet />
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default StartLayout;