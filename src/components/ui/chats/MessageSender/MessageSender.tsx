
import { useState } from "react";
import styles from "./MessageSender.module.scss"
import { useAuth, useChats, useWebSocket } from "@/lib";
import { IChatMessage } from "@/lib/types/chat";
import TextareaRT1 from "../../TextareaRT1/TextareaRT1";
import PaperPlaneIcon from "@/components/icons/PaperPlaneIcon";

const MessageSender = () => {
    const { user } = useAuth();

    const { currentChatOpenId, pushMessages } = useChats();

    const { client, connected } = useWebSocket();
    const [message, setMessage] = useState("");

    // Проверка, можно ли писать сообщение
    const isDisabled = !currentChatOpenId;

    const sendMessage = () => {

        if (!client || !connected || !user) return;

        if (!currentChatOpenId) {
            alert("Пожалуйста, выберите диалог для отправки сообщения");
            return;
        }

        const trimmed = message.trim();
        if (!trimmed) return;

        const newMsg: IChatMessage = {
            openId: Date.now().toString(),
            content: trimmed,
            senderOpenId: user.openId,
            chatOpenId: currentChatOpenId,
            timestamp: new Date().toISOString(),
            read: false
        }

        pushMessages(newMsg)
        
        const msg = {
            content: trimmed,
            senderOpenId: user.openId,
            chatOpenId: currentChatOpenId
        };

        client.publish({
            destination: `/app/chat.message-send`,
            body: JSON.stringify(msg)
        });

        setMessage(""); // очищаем поле ввода
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={styles.messageInputContainer}>
            <TextareaRT1
                value={message} 
                setValue={setMessage} 
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                className="" 
                placeholder={isDisabled ? "" : "Введите сообщение..."}
            />
            <button
                className={styles.sendBtn}
                onClick={sendMessage}
                disabled={isDisabled}
            >
                <PaperPlaneIcon className={styles.icon} />
            </button>
        </div>
    );
};
export default MessageSender;