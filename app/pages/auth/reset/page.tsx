'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './style.module.css';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Щось пішло не так');

            setMessage('Інструкції надіслано на вашу пошту (якщо аккаунт існує)');
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
                <Link href="/" className={styles.back_link}>← До входу</Link>

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
                    
                    <h1 className={styles.title}>Відновлення доступу</h1>
                    <p className={styles.subtitle}>
                        Введіть ваш email, і ми надішлемо вам інструкції
                    </p>

                    <form className={styles.form} onSubmit={handleReset}>
                        {error && <p className={styles.error_msg}>{error}</p>}
                        {message && <p className={styles.success_msg}>{message}</p>}
                        
                        <input 
                            type="email" 
                            placeholder="Ваш E-mail" 
                            className={styles.input} 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button type="submit" className={styles.submit_btn} disabled={loading}>
                            {loading ? 'Надсилання...' : 'Надіслати посилання'}
                        </button>
                        
                        <Link href="/pages/registr" className={styles.secondary_link}>
                            Створити новий аккаунт
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}