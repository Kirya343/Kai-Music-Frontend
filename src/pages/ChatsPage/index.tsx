import styles from "./ChatsPage.module.scss"
import ChatItem from "@/components/ui/chats/ChatItem/ChatItem";
import MessagesConteiner from "@/components/ui/chats/MessagesConteiner/MessagesConteiner";
import MessageSender from "@/components/ui/chats/MessageSender/MessageSender";
import { useChats } from "@/lib";
import { useChatSubscription } from "@/lib/hooks/messenger/useChatSubscription";
import { useChatsLoad } from "@/lib/hooks/messenger/useChatsLoad";
import { useEffect } from "react";

const ChatsPage = () => {

    const { chats, currentChatOpenId, setCurrentChatOpenId } = useChats();

    useChatSubscription();
    useChatsLoad();

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                setCurrentChatOpenId(null);
            }
        });
    }, []);

    return (
        <div className={`${styles.layout} ${currentChatOpenId ? styles.chatOpened : ""}`}>
            <div className={styles.chats}>
                {chats?.map(chat => (
                    <ChatItem chat={chat} key={chat.openId} />
                ))}
            </div>
            <div className={styles.chatConteiner}>
                {currentChatOpenId ? (
                    <>
                        <MessagesConteiner />
                    </>
                ) : (
                    <div className={styles.noSelectedChat}>
                        <h2>Чат не выбран</h2>
                        <span className={styles.subTitle}>Выберите чат из списка, чтобы начать общение</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatsPage;