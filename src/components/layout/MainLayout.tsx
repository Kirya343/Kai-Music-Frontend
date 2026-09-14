import Audio from "@/components/ui/player/Audio/Audio";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.scss"
import { useGlobal } from "@/lib/contexts/GlobalContext";
import { AnimatePresence, motion } from "motion/react"
import clsx from "clsx";
import Header from "../ui/Header/Header";

const MainLayout = () => {

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
                        
                        <Header/>

                        <main className={styles.main}>
                            <Outlet />
                        </main>

                        <Audio />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MainLayout;