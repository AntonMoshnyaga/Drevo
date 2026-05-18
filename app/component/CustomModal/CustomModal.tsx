import styles from './style.module.css';

interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function CustomModal({ isOpen, title, message, onConfirm, onCancel }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className={styles.actions}>
                    <button onClick={onCancel} className={styles.cancel_btn}>Скасувати</button>
                    <button onClick={onConfirm} className={styles.confirm_btn}>Підтвердити</button>
                </div>
            </div>
        </div>
    );
}