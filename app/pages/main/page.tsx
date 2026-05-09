'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import FamilyCard from '../../component/FamilyCard/FamilyCard';
import styles from './style.module.css';
import Button from '../../component/button/button';
import { useAuth } from '@/lib/context/AuthContext';

interface Family {
    id: number;
    name: string;
    count: number;
}

export default function MainPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [families, setFamilies] = useState<Family[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    // 1. Стан для пошукового запиту
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [familyName, setFamilyName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchFamilies = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`/api/family?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFamilies(data);
                }
            } catch (error) {
                console.error("Помилка завантаження сімей:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchFamilies();
    }, [user?.id]);

    // 2. Фільтрація списку сімей на основі searchQuery
    // Використовуємо useMemo, щоб не перераховувати список при кожному рендері, якщо дані не змінилися
    const filteredFamilies = useMemo(() => {
        return families.filter(family => 
            family.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [families, searchQuery]);

    const handleCreateFamily = async () => {
        if (!familyName.trim() || !user?.id) return;
        setIsCreating(true);
        try {
            const response = await fetch('/api/family/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: familyName, userId: user.id })
            });

            if (response.ok) {
                const newFamilyData = await response.json();
                setFamilies(prev => [...prev, newFamilyData]);
                setIsModalOpen(false);
                setFamilyName('');
                router.push(`/pages/family/${newFamilyData.id}`);
            }
        } catch (error) {
            alert('Помилка при створенні');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={styles.page_container}>
            <header className={styles.header}>
                <div className={styles.logo_wrapper}>
                    <Image src="/DrevoLogo.svg" alt="Drevo Logo" width={150} height={150} />
                </div>
                <h1 className={styles.welcome_text}>З поверненням, {user?.name || '...'}!</h1>
                <div className={styles.underline}></div>
            </header>

            <main className={styles.main_content}>
                <div className={styles.search_container}>
                    <div className={styles.search_wrapper}>
                        {/* 3. Прив'язка інпуту до стану searchQuery */}
                        <input 
                            type="text" 
                            placeholder="Пошук сім'ї..." 
                            className={styles.search_input} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className={styles.search_button}>
                            <Image 
                                src="/search.svg" 
                                alt="Пошук" 
                                width={20} 
                                height={20} 
                            />
                        </button>
                    </div>
                </div>

                <Button onClick={() => setIsModalOpen(true)} variant="outline" className={styles.add_family_btn}>
                    Додати сім’ю
                </Button>

                <div className={styles.grid}>
                    {isLoadingData ? (
                        <div className={styles.loading_state}>Завантаження ваших дерев...</div>
                    ) : filteredFamilies.length > 0 ? (
                        // 4. Використовуємо filteredFamilies замість звичайного families
                        filteredFamilies.map((family) => (
                            <FamilyCard 
                                key={family.id} 
                                name={family.name} 
                                count={family.count} 
                                onClick={() => router.push(`/pages/family/${family.id}`)}
                            />
                        ))
                    ) : (
                        <div className={styles.empty_state}>
                            <h2 className={styles.empty_title}>
                                {searchQuery ? 'Нічого не знайдено' : 'Ваш сад ще порожній'}
                            </h2>
                            <p className={styles.empty_text}>
                                {searchQuery 
                                    ? `За запитом "${searchQuery}" результатів немає.` 
                                    : 'Ви ще не створили жодного сімейного дерева.'}
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Модальне вікно залишається без змін */}
            {isModalOpen && (
                <div className={styles.modal_overlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modal_title}>Створити сімейне дерево?</h2>
                        <div className={styles.modal_divider}></div>
                        <input 
                            type="text" 
                            placeholder="Назва сім’ї" 
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                            className={styles.modal_input}
                        />
                        <button 
                            className={styles.modal_submit_btn} 
                            onClick={handleCreateFamily}
                            disabled={isCreating || !familyName.trim()}
                        >
                            {isCreating ? 'Створення...' : 'Створити'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}