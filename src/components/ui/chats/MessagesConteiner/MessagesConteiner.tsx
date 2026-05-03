import { useLayoutEffect, useRef } from "react";
import styles from "./MessagesConteiner.module.scss"
import { useChats } from "@/lib";
import MessagesGroup from "../MessagesGroup/MessagesGroup";

const MessagesConteiner = () => {

    const { messages } = useChats();
    const messagesContainer = useRef<HTMLDivElement  | null>(null);

    useLayoutEffect(() => {
        const el = messagesContainer.current;

        if (!el) return;

        el.scrollTop = el.scrollHeight;
    }, [messages]);

    return (
        <div 
            className={styles.messagesContainer} 
            ref={messagesContainer}
        >
            {(messages?.length === 0) && (
                <p>Нет сообщений</p>
            )}

            {messages?.map((group) => (
                <MessagesGroup group={group} key={group.openId} />
            ))}
        </div>
    )
}

export default MessagesConteiner;