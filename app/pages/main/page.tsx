'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import FamilyCard from '../../component/FamilyCard/FamilyCard';
import styles from './style.module.css';
import Button from '../../component/button/button';
import { useAuth } from '@/lib/context/AuthContext';
import CustomModal from '@/app/component/CustomModal/CustomModal';

interface Family {
    id: number;
    name: string;
    count: number;
    role: string | number;
}

export default function MainPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [families, setFamilies] = useState<Family[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Стан для створення сім'ї
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [familyName, setFamilyName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Стан для приєднання
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [inputJoinCode, setInputJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    // ВИПРАВЛЕНО: Стан для динамічних повідомлень через CustomModal
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const closeAlertModal = () => setAlertModal(null);

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

    useEffect(() => {
        fetchFamilies();
    }, [user?.id]);

    const filteredFamilies = useMemo(() => {
        return families.filter(family => 
            family.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [families, searchQuery]);

    const handleJoinByCode = async () => {
        if (!inputJoinCode.trim() || !user?.id) return;

        setIsJoining(true);
        try {
            const response = await fetch('/api/family/invate', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: inputJoinCode.trim().toUpperCase(),
                    accountId: user.id
                })
            });

            const data = await response.json();

            if (response.ok) {
                setIsJoinModalOpen(false);
                setInputJoinCode('');
                
                // ВИПРАВЛЕНО: Правильний виклик модалки успіху
                setAlertModal({
                    isOpen: true,
                    title: "Успіх",
                    message: "Ви успішно приєдналися до сім’ї!",
                    onConfirm: () => {
                        closeAlertModal();
                        fetchFamilies(); // Оновлюємо список
                    }
                });
            } else {
                setAlertModal({
                    isOpen: true,
                    title: "Помилка",
                    message: data.message || 'Помилка приєднання',
                    onConfirm: closeAlertModal
                });
            }
        } catch (error) {
            console.error("Помилка:", error);
            setAlertModal({
                isOpen: true,
                title: "Помилка",
                message: "Сталася помилка на сервері",
                onConfirm: closeAlertModal
            });
        } finally {
            setIsJoining(false);
        }
    };

    const handleDeleteFamily = async (familyId: string) => {
        if (!window.confirm("Ви впевнені, що хочете видалити цю сім'ю та всі зв'язки?")) return;
        try {
            const response = await fetch(`/api/family/deleteFamily`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: familyId })
            });

            if (response.ok) {
                setFamilies(prev => prev.filter(f => String(f.id) !== familyId));
            }
        } catch (error) {
            console.error("Помилка при видаленні:", error);
        }
    };

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
            setAlertModal({
                isOpen: true,
                title: "Помилка",
                message: "Помилка при створенні сім'ї",
                onConfirm: closeAlertModal
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={styles.page_container}>
            <header className={styles.header}>
                <div className={styles.logo_wrapper}>
                    <Image 
                        src="/DrevoLogo.svg" 
                        alt="Drevo Logo" 
                        width={140} 
                        height={140} 
                        className={styles.logo_img}
                    />
                </div>
                <h1 className={styles.welcome_text}>З поверненням, {user?.name || '...'}!</h1>
                <div className={styles.underline}></div>
            </header>

            <main className={styles.main_content}>
                <div className={styles.search_container}>
                    <div className={styles.search_wrapper}>
                        <input 
                            type="text" 
                            placeholder="Пошук сім'ї..." 
                            className={styles.search_input} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className={styles.search_button}>
                            <Image src="/search.svg" alt="Пошук" width={20} height={20} />
                        </button>
                    </div>
                </div>

                <div className={styles.actions_container}>
                    <Button onClick={() => setIsModalOpen(true)} variant="outline" className={styles.add_family_btn}>
                        Додати сім’ю
                    </Button>
                    
                    <Button onClick={() => setIsJoinModalOpen(true)} variant="outline" className={styles.add_family_btn}>
                        Приєднатися до сім’ї
                    </Button>
                </div>

                <div className={styles.grid}>
                    {isLoadingData ? (
                        <div className={styles.loading_state}>Завантаження ваших дерев...</div>
                    ) : filteredFamilies.length > 0 ? (
                        filteredFamilies.map((family) => (
                            <FamilyCard 
                                key={family.id} 
                                id={String(family.id)} 
                                name={family.name} 
                                count={family.count} 
                                role={family.role}
                                onClick={() => router.push(`/pages/family/${family.id} `)}
                                onDelete={(id) => handleDeleteFamily(id)}
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

            {isJoinModalOpen && (
                <div className={styles.modal_overlay} onClick={() => setIsJoinModalOpen(false)}>
                    <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modal_title}>Приєднатися за кодом</h2>
                        <div className={styles.modal_divider}></div>
                        <input 
                            type="text" 
                            placeholder="Введіть код" 
                            value={inputJoinCode}
                            onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                            className={styles.modal_input}
                            maxLength={10}
                        />
                        <button 
                            className={styles.modal_submit_btn} 
                            onClick={handleJoinByCode}
                            disabled={isJoining || !inputJoinCode.trim()}
                            style={{ backgroundColor: '#FFD700', color: '#000' }}
                        >
                            {isJoining ? 'Приєднання...' : 'Приєднатися'}
                        </button>
                    </div>
                </div>
            )}

            {alertModal && (
                <CustomModal 
                    isOpen={alertModal.isOpen} 
                    title={alertModal.title} 
                    message={alertModal.message} 
                    onConfirm={alertModal.onConfirm} 
                    onCancel={closeAlertModal} 
                />
            )}
        </div>
    );
}