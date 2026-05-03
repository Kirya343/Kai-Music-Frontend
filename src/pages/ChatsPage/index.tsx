import styles from "./ChatsPage.module.scss"
import ChatItem from "@/components/ui/chats/ChatItem/ChatItem";
import MessagesConteiner from "@/components/ui/chats/MessagesConteiner/MessagesConteiner";
import MessageSender from "@/components/ui/chats/MessageSender/MessageSender";
import { useChats } from "@/lib";
import { useChatSubscription } from "@/lib/hooks/messenger/useChatSubscription";
import { useChatsLoad } from "@/lib/hooks/messenger/useChatsLoad";

const ChatsPage = () => {

    const { chats } = useChats();

    useChatSubscription();
    useChatsLoad();

    return (
        <div className={styles.layout}>
            <div className={styles.chats}>
                {chats?.map(chat => (
                    <ChatItem chat={chat} key={chat.openId} />
                ))}
            </div>
            <div className={styles.chatConteiner}>
                <MessagesConteiner />
                <MessageSender />
            </div>
        </div>
    )
}

export default ChatsPage;