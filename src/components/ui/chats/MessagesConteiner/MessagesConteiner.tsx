import { useLayoutEffect, useMemo, useRef } from "react";
import styles from "./MessagesConteiner.module.scss"
import { IShortUser, useAuth, useChats } from "@/lib";
import MessagesGroup from "../MessagesGroup/MessagesGroup";
import MessageSender from "../MessageSender/MessageSender";
import LeftArrowIcon from "@/components/icons/LeftArrowIcon";

const MessagesConteiner = () => {

    const { messages } = useChats();
    const messagesContainer = useRef<HTMLDivElement  | null>(null);
    const { setCurrentChatOpenId, currentChat } = useChats();
    const { user } = useAuth();

    const chatInterlocutor = useMemo<IShortUser | null>(
        () => currentChat?.interlocutors?.find(i => i.openId != user?.openId) ?? null, [currentChat]);

    useLayoutEffect(() => {
        const el = messagesContainer.current;

        if (!el) return;

        el.scrollTop = el.scrollHeight;
    }, [messages]);

    return (
        <>
            <div className={styles.header}>
                <button
                    onClick={() => setCurrentChatOpenId(null)} 
                    className={styles.mobileDialogsToggle}
                >
                    <LeftArrowIcon className={styles.icon}/>
                </button>
                <h4>{currentChat?.name ?? chatInterlocutor?.name}</h4>
            </div>
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
            <MessageSender />
        </>
    )
}

export default MessagesConteiner;