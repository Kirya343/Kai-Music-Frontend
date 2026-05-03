import { GroupedMessages, IChatMessage } from "@/lib/types/chat";
import styles from "./MessagesGroup.module.scss"
import { useAuth, useChats } from "@/lib";

const MessagesGroup = ({group}: {group: GroupedMessages}) => {

    const { user } = useAuth();
    const { currentChat } = useChats();
    const isOwn = (group.senderOpenId == user?.openId)
    const author = isOwn ? user : currentChat?.interlocutors?.find((i) => i.openId === group.senderOpenId) ?? null;

    return (
        <div className={`${styles.messagesGroup} ${isOwn ? styles.out : styles.in}`}>
            <div className={styles.messages}>
                {group.messages?.map((message) => (
                    <Message 
                        key={message.openId}
                        message={message}
                        authorName={author?.name}
                    />
                ))}
            </div>
        </div>
    )
}

const Message = ({message, authorName}: {message: IChatMessage, authorName?: string}) => {

    const date = new Date(message.timestamp ?? 0);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return (
        <div className={styles.message}>
            <span className={styles.authorName}>{authorName}</span>
            <div className={styles.content}>
                <span className={styles.messageText}>{message.content}</span>
                <span className={styles.messageTime}>{formattedTime}</span>
            </div>
        </div>
    );
};

export default MessagesGroup;