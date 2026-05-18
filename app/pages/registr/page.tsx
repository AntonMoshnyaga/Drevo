'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './style.module.css';
import { useAuth } from '../../../lib/context/AuthContext'; 

export default function RegisterPage() {
    const router = useRouter();
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

            if (data.user) {
                login(data.user);
            }
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
                        <Image 
                            src="/DrevoLogo.svg" 
                            alt="Drevo Logo" 
                            width={180} 
                            height={180} 
                            className={styles.logo_img}
                        />
                    </div>
                    
                    <h1 className={styles.title}>Створення акаунту</h1>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        {error && <p className={styles.error_msg}>{error}</p>}
                        
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
                        
                        <div className={styles.login_prompt}>
                            <Link href="/pages/auth" className={styles.login_link}>
                                Вже є аккаунт? Увійти
                            </Link>
                        </div>

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