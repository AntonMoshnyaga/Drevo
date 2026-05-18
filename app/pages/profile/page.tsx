'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import styles from './style.module.css';
import CustomModal from '@/app/component/CustomModal/CustomModal';

export default function ProfilePage() {
    const { user, login, logout } = useAuth(); 
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); 
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '', 
        avatar: null as string | null
    });

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'confirm' | 'info';
    } | null>(null);

    const closeModal = () => setModalConfig(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                avatar: user.photo_url || null
            });
        }
    }, [user]);

    const handleEditClick = () => setIsEditing(true);

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                avatar: user.photo_url || null
            });
        }
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setIsLoading(true);

        try {
            const res = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user.id,
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    avatar: formData.avatar
                })
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Отримано не JSON! Ось що прислав сервер:", text);
                throw new Error("Сервер повернув помилку (HTML замість JSON)");
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Помилка оновлення');
            }

            const updatedUser = { 
                ...user, 
                name: formData.name, 
                email: formData.email,
                photo_url: formData.avatar
            };
            
            login(updatedUser); 
            setIsEditing(false);
            setFormData(prev => ({ ...prev, password: '' })); 

            setModalConfig({
                isOpen: true,
                title: "Успіх",
                message: "Дані успішно збережено!",
                type: 'info',
                onConfirm: closeModal
            });

        } catch (error: any) {
            console.error(error);
            setModalConfig({
                isOpen: true,
                title: "Помилка",
                message: error.message || 'Не вдалося зберегти зміни',
                type: 'info',
                onConfirm: closeModal
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccountRequest = () => {
        setModalConfig({
            isOpen: true,
            title: "Видалення акаунту",
            message: "Ви впевнені, що хочете назавжди видалити свій акаунт? Цю дію неможливо скасувати.",
            type: 'confirm',
            onConfirm: executeDeletion, 
        });
    };

    const executeDeletion = async () => {
        if (!user?.id) return;
        closeModal(); 
        setIsDeleting(true);

        try {
            const res = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Не вдалося видалити акаунт');
            }

            setModalConfig({
                isOpen: true,
                title: "Успіх",
                message: "Ваш акаунт було успішно видалено.",
                type: 'info',
                onConfirm: () => {
                    if (logout) logout();
                    router.push('/pages/auth');
                }
            });

        } catch (error: any) {
            console.error("Помилка видалення:", error);
            setModalConfig({
                isOpen: true,
                title: "Помилка",
                message: error.message || 'Сталася помилка при видаленні акаунта.',
                type: 'info',
                onConfirm: closeModal
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.page_container}>
            <main className={styles.main}>
                <div className={styles.profile_card}>
                    <div className={styles.avatar_container}>
                        <div 
                            className={`${styles.avatar_placeholder} ${isEditing ? styles.editable_avatar : ''}`}
                            onClick={handleAvatarClick}
                            style={{ cursor: isEditing ? 'pointer' : 'default' }}
                        >
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" className={styles.avatar_image} />
                            ) : (
                                <span>фотографія</span>
                            )}
                            
                            {isEditing && (
                                <div className={styles.avatar_overlay}>
                                    Змінити
                                </div>
                            )}
                        </div>

                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                        />

                        {!isEditing && (
                            <button 
                                className={styles.edit_icon} 
                                onClick={handleEditClick}
                                title="Редагувати профіль"
                            >
                                <Image src="/edit.svg" alt="Редагувати" width={24} height={24} />
                            </button>
                        )}
                    </div>

                    <div className={styles.form_group}>
                        <div className={styles.input_wrapper}>
                            <input 
                                type="text" 
                                name="name"
                                placeholder="Ім’я" 
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.input} 
                                disabled={!isEditing} 
                            />
                        </div>
                        <div className={styles.input_wrapper}>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="E-mail" 
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input} 
                                disabled={!isEditing} 
                            />
                        </div>
                        <div className={styles.input_wrapper}>
                            <input 
                                type="password" 
                                name="password"
                                placeholder={isEditing ? "Новий пароль (залиште пустим)" : "********"} 
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input} 
                                disabled={!isEditing} 
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className={styles.edit_actions_container}>
                            <div className={styles.button_group}>
                                <button className={styles.save_btn} onClick={handleSave} disabled={isLoading || isDeleting}>
                                    {isLoading ? 'Збереження...' : 'Зберегти'}
                                </button>
                                <button className={styles.cancel_btn} onClick={handleCancel} disabled={isLoading || isDeleting}>
                                    Відмінити
                                </button>
                            </div>

                            <div className={styles.delete_section}>
                                <button 
                                    className={styles.delete_btn}
                                    onClick={handleDeleteAccountRequest}
                                    disabled={isLoading || isDeleting}
                                >
                                    {isDeleting ? 'Видалення...' : 'Видалити акаунт'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {modalConfig && (
                <CustomModal 
                    isOpen={modalConfig.isOpen}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    onConfirm={modalConfig.onConfirm}
                    onCancel={closeModal}
                />
            )}
        </div>
    );
}