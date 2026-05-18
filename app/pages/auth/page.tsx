'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './style.module.css';
import { useAuth } from '../../../lib/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            login(data.user); 

            router.push('/pages/main');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.auth_wrapper}>
            <div className={styles.hero_side}>
                <Image src="/geese_background.svg" alt="Geese" fill className={styles.bg_image} priority />
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.form_side}>
                <Link href="/" className={styles.back_link}>← Назад</Link>

                <div className={styles.form_container}>
                    <div className={styles.logo_wrapper}>
                        <Image 
                            src="/DrevoLogo.svg" 
                            alt="Drevo Logo" 
                            width={160} 
                            height={160} 
                            className={styles.logo_img}
                        />
                    </div>
                    
                    <h1 className={styles.title}>З поверненням</h1>

                    <form className={styles.form} onSubmit={handleLogin}>
                        {error && <p className={styles.error_msg}>{error}</p>}
                        
                        <input 
                            type="text" 
                            placeholder="E-mail або ім’я" 
                            className={styles.input} 
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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
                        
                        <div className={styles.links_group}>
                            <Link href="/pages/registr" className={styles.secondary_link}>
                                Відсутній аккаунт?
                            </Link>
                            <Link href="/pages/auth/reset" className={styles.secondary_link}>
                                Забули пароль?
                            </Link>
                        </div>

                        <button type="submit" className={styles.submit_btn} disabled={loading}>
                            {loading ? 'Вхід...' : 'Увійти'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}