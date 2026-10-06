import clsx from "clsx";
import styles from "./AuthLayout.module.scss"
import type { ReactNode } from "react";
import { LoadingSpinnerIcon } from "@/assets/icons";

interface AuthlayoutProps {
    title: string;
    message: { message: string, success: boolean} | "loading" | null;
    inputs: ReactNode;
    links: ReactNode;
}

const AuthLayout = ({ title, message, inputs, links }: AuthlayoutProps) => {
    return (
       <div className={styles.body}>

            <div className={styles.formWrap} role="main">
                
                <div className={styles.logo}>
                    <img src="/image/logo.png"/>
                </div>

                <h1>{title}</h1>

                <div className={styles.messageConteiner}>
                    {message && (
                        message === "loading" ? (
                            <div className={clsx(styles.messageConteiner)}>
                                <LoadingSpinnerIcon/>
                            </div>
                        ) : (
                            <div className={clsx(styles.message, message?.success ? styles.success : styles.error)}>
                                {message?.message}
                            </div>
                        )
                    )}
                </div>

                <div className={styles.inputs}>
                    {inputs}
                </div>

                <div className={styles.links}>
                    {links}
                </div>

            </div>
       </div> 
    )
}

export default AuthLayout;