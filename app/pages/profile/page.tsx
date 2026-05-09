'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext'; // Підключаємо ваш контекст
import styles from './style.module.css';

export default function ProfilePage() {
    const { user, login } = useAuth(); // Отримуємо поточного користувача
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Стейт форми
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '', // Залишаємо порожнім, якщо не змінюємо
        avatar: null as string | null
    });

    // Заповнюємо форму даними користувача при завантаженні сторінки
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

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        // Скидаємо зміни до поточних даних користувача
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

    // Читаємо файл і перетворюємо його в Base64 для відправки на сервер
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Зберігаємо рядок Base64 у стейт
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Збереження змін
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
                    avatar: formData.avatar // Base64 рядок
                })
            });

            const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await res.text(); // Читаємо як текст, а не JSON
                    console.error("Отримано не JSON! Ось що прислав сервер:", text);
                    throw new Error("Сервер повернув помилку (HTML замість JSON)");
                }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Помилка оновлення');
            }

            // Оновлюємо глобальний стан через контекст
            const updatedUser = { 
                ...user, 
                name: formData.name, 
                email: formData.email,
                photo_url: formData.avatar
            };
            
            // Викликаємо функцію логіну або оновлення з контексту
            login(updatedUser); 
            setIsEditing(false);
            setFormData(prev => ({ ...prev, password: '' })); // Очищуємо поле пароля після збереження
            
            alert('Дані успішно збережено!');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Не вдалося зберегти зміни');
        } finally {
            setIsLoading(false);
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
                                <div className={styles.avatar_overlay} style={{position: 'absolute', background: 'rgba(0,0,0,0.5)', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
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
                                placeholder={isEditing ? "Новий пароль (залиште пустим, щоб не міняти)" : "********"} 
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input} 
                                disabled={!isEditing} 
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className={styles.button_group}>
                            <button className={styles.save_btn} onClick={handleSave} disabled={isLoading}>
                                {isLoading ? 'Збереження...' : 'Зберегти'}
                            </button>
                            <button className={styles.cancel_btn} onClick={handleCancel} disabled={isLoading}>
                                Відмінити
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}