"use client"

import { ReactNode, useEffect, useRef } from 'react';

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

    return (
        <dialog ref={dialogRef} className="modal fade-down" onClick={(e) => e.stopPropagation()} id={id}>
            <span className="close-modal hover" onClick={onClose}><i className="fa-solid fa-xmark"></i></span>
            {title && <h2>{title}</h2>}
            {children}
        </dialog>
    );
};

export default Modal;