import { ReactNode, useEffect, useRef } from "react";

import styles from "./Modal.module.scss";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    id?: string;
    children: ReactNode;
}

/**
 * Modal is a parent component for creating modals on his base
 * 
 * @param isOpen controls - should modal be visible? 
 * @param onClose void that closes modal
 * @param title is string title to display in modal header
 * @param id is the unuque id for every modal
 * @param children is content of inheritance modal
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    id = "normalModal",
    children,
}: ModalProps) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (isOpen) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else if (dialog.open) {
            dialog.close();
        }

        const handleCancel = (event: Event) => {
            event.preventDefault();
            onClose();
        };

        dialog.addEventListener("cancel", handleCancel);

        return () => {
            dialog.removeEventListener("cancel", handleCancel);
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (
        event: React.MouseEvent<HTMLDialogElement>
    ) => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        const rect = dialog.getBoundingClientRect();

        const clickedInDialog =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width;

        if (!clickedInDialog) {
            onClose();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.modal}
            id={id}
            onClick={handleBackdropClick}
        >
            <span
                className={`${styles.close} hover`}
                onClick={onClose}
            >
                ✖
            </span>

            {title && <h2>{title}</h2>}

            {children}
        </dialog>
    );
};

export default Modal;