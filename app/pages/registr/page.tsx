'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './style.module.css';
// 1. Імпортуємо хук useAuth
import { useAuth } from '../../../lib/context/AuthContext'; 

export default function RegisterPage() {
    const router = useRouter();
    // 2. Отримуємо функцію login з контексту
    const { login } = useAuth(); 
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Щось пішло не так');
            }

            // 3. ВИКЛИКАЄМО LOGIN: передаємо дані користувача, які прийшли з сервера
            // Це оновить глобальний стан (і Header) та запише дані в localStorage
            if (data.user) {
                login(data.user);
            }

            // 4. Перенаправляємо на головну сторінку Drevo
            router.push('/pages/main'); 
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.auth_wrapper}>
            <div className={styles.hero_side}>
                <Image 
                    src="/geese_background.svg" 
                    alt="Geese"
                    fill
                    className={styles.bg_image}
                    priority
                />
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.form_side}>
                <Link href="/" className={styles.back_link}>
                    ← Назад
                </Link>

                <div className={styles.form_container}>
                    <div className={styles.logo_wrapper}>
                        <Image src="/DrevoLogo.svg" alt="Drevo Logo" width={180} height={180} />
                    </div>
                    
                    <h1 className={styles.title}>Створення акаунту</h1>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        {error && <p className={styles.error_msg} style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                        
                        <input 
                            type="text" 
                            placeholder="Ваше ім’я" 
                            className={styles.input} 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input 
                            type="email" 
                            placeholder="E-mail" 
                            className={styles.input} 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input 
                            type="password" 
                            placeholder="Пароль" 
                            className={styles.input} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        
                        <p className={styles.login_prompt}>
                            <Link href="/pages/auth" className={styles.login_link}>
                                Вже є аккаунт? Увійти
                            </Link>
                        </p>

                        <button 
                            type="submit" 
                            className={styles.submit_btn}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Завантаження...' : 'Зареєструватись'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}