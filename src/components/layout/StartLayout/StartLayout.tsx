import { Outlet } from "react-router-dom";
import styles from "./StartLayout.module.scss"
import { useGlobal } from "@common";
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx";
import { AuthProvider } from "@auth";
import { RoomPlaybackProvider } from "@playback";
import { WebSocketProvider } from "@websocket";

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
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 1 }}
                        className={styles.content}
                    >
                        <AuthProvider>
                            <WebSocketProvider>
                                <RoomPlaybackProvider>
                                    <Outlet />
                                </RoomPlaybackProvider>
                            </WebSocketProvider>
                        </AuthProvider>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default StartLayout;