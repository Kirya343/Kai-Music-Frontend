"use client"

import { ReactNode, useEffect, useRef } from 'react';
import styles from "./Modal.module.scss"

interface ModalProps {
    isOpen: boolean;
    onClose: () => void,
    title: string;
    id?: string;
    children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, id = 'normalModal', children }: ModalProps) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }

        const handleCancel = (e: Event) => {
            e.preventDefault();
            onClose();
        };

        dialog.addEventListener("cancel", handleCancel);
        return () => dialog.removeEventListener("cancel", handleCancel);
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        const rect = dialog.getBoundingClientRect();

        const clickedInDialog =
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width;

        if (!clickedInDialog) {
            onClose();
        }
    };

    return (
        <dialog 
            ref={dialogRef} 
            className={`${styles.modal} fade-down`} 
            id={id}
            onClick={handleBackdropClick}
        >
            <span className={`${styles.close} hover`} onClick={onClose}>✖</span>
            {title && <h2>{title}</h2>}
            {children}
        </dialog>
    );
};

export default Modal;