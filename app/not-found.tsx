'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import styles from './error.module.css'; 
import { useRouter } from 'next/navigation';
import Button from './component/button/button';

export default function NotFound() {
    
    const router = useRouter();
    const { user } = useAuth();
    const homeHref = user ? "/pages/main" : "/";

    return (
        <div className={styles.error_wrapper}>
            <div className={styles.logo_animation}>
                <Image src="/DrevoLogo.svg" alt="404" width={120} height={120} />
            </div>
            <h1 className={styles.code}>404</h1>
            <h2 className={styles.title}>Гілка не знайдена</h2>
            <p className={styles.description}>
                Схоже, ми заблукали в лісі. Ця сторінка не існує або була перенесена в іншу частину дерева.
            </p>
            <div className={styles.actions}>
                <Button href={homeHref} variant="primary">
                    На головну
                </Button>
            </div>
        </div>
    );
}