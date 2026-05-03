import { IChat } from "@/lib/types/chat";
import styles from "./ChatItem.module.scss"
import { useAuth, useChats } from "@/lib";
import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const ChatItem = ({ chat }: { chat: IChat }) => {

    const {user} = useAuth();
    
    const [searchParams] = useSearchParams();
    const startChatId = searchParams.get("chatId") || null;

    const { currentChatOpenId, setCurrentChatOpenId, unreadMessages } = useChats();
    const [loading, setLoading] = useState(false);

    const interlocutor = chat?.interlocutors?.find(i => i.openId != user?.openId) ?? null;

    const unreadForChat = unreadMessages?.filter(m => m.chatOpenId === chat.openId) ?? []

    const lastMessage = unreadForChat.length > 0
        ? unreadForChat.reduce((latest, msg) =>
            new Date(msg.timestamp ?? 0).getTime() > new Date(latest.timestamp ?? 0).getTime() ? msg : latest
        ) : null
        
    useEffect(() => {
        if(!loading && startChatId == chat.openId) {
            setCurrentChatOpenId(chat.openId);
        }
    }, [setCurrentChatOpenId, loading, chat, startChatId]);

    const formattedDate = chat.lastMessage?.timestamp 
        ? new Date(chat.lastMessage?.timestamp).toLocaleDateString('ru-RU')
        : "";

    const preview = useMemo(() => {
        if (!lastMessage?.timestamp) return chat.lastMessage?.content;
        return new Date(chat.lastMessage?.timestamp ?? 0) > new Date(lastMessage.timestamp)
            ? chat.lastMessage?.content
            : lastMessage.content;
    }, [chat, lastMessage]);

    return (
        <div className={styles.box}>
            <div className={`${styles.dialog} ${chat.openId === currentChatOpenId ? styles.active : ""}`} onClick={() => setCurrentChatOpenId(chat.openId)}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h4>{interlocutor?.name}</h4>
                        <span className={styles.time}>{formattedDate}</span>
                    </div>
                    <div className={styles.meta}>
                        <p className={styles.preview}>{preview}</p>
                        {unreadForChat.length > 0 && <span className={styles.unreadCount}>{unreadForChat.length}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatItem;