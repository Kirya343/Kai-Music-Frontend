import { Outlet } from "react-router-dom";
import styles from "./StartLayout.module.scss"
import { useGlobal } from "@/lib/contexts/GlobalContext";
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx";
import { AuthProvider, ListeningRoomProvider, WebSocketProvider } from "@/lib";

const StartLayout = () => {

    const { started, setStarted } = useGlobal();

    return (
        <div className={clsx(styles.layout, started && styles.started)}>
            <AnimatePresence>
                {!started && (
                    <div className={styles.startWrapper} onClick={() => setStarted(true)}>
                        <h2 className={styles.start}>Click anywhere<br/> to start</h2>
                    </div>
                )}

                {started && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7 }}
                        className={styles.content}
                    >
                        <AuthProvider>
                            <WebSocketProvider>
                                <ListeningRoomProvider>
                                    <Outlet />
                                </ListeningRoomProvider>
                            </WebSocketProvider>
                        </AuthProvider>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default StartLayout;