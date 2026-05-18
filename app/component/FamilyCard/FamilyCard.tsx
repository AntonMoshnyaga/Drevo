import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './style.module.css';
import { useAuth } from '@/lib/context/AuthContext';
import CustomModal from '@/app/component/CustomModal/CustomModal';

interface FamilyCardProps {
    id: string;
    name: string;
    count: number;
    role: string | number;
    onClick?: () => void;
    onDelete?: (id: string) => void;
}

export default function FamilyCard({ id, name, count, role, onClick, onDelete }: FamilyCardProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [joinCode, setJoinCode] = useState<string | null>(null);
    const [isLoadingCode, setIsLoadingCode] = useState(false);
    const [inputCode, setInputCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const [modalNotification, setModalNotification] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    } | null>(null);

    const isOwner = role === 'owner' || role === 1 || role === '1';

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleJoinByCode = async () => {
        if (!inputCode.trim() || !user?.id) return;

        setIsJoining(true);
        try {
            const response = await fetch('/api/family/invate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: inputCode.trim(),
                    accountId: user.id
                })
            });

            const data = await response.json();

            if (response.ok) {
                setModalNotification({
                    isOpen: true,
                    title: "Успіх",
                    message: "Ви успішно приєдналися до сім’ї!"
                });
                setIsModalOpen(false);
                router.refresh();
            } else {
                setModalNotification({
                    isOpen: true,
                    title: "Помилка",
                    message: data.message || "Щось пішло не так"
                });
            }
        } catch (error) {
            setModalNotification({
                isOpen: true,
                title: "Помилка",
                message: "Помилка приєднання до сім’ї!"
            });
            console.error("Помилка приєднання:", error);
        } finally {
            setIsJoining(false);
        }
    };

    const openModal = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
        setIsMenuOpen(false);

        if (!joinCode && user?.id) {
            setIsLoadingCode(true);
            try {
                const response = await fetch('/api/family/codeJoin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        familyId: id,
                        accountId: user.id,
                        roleId: 2 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setJoinCode(data.code);
                } else {
                    console.error("Деталі помилки від сервера:", data);
                    setModalNotification({
                        isOpen: true,
                        title: "Помилка",
                        message: `Помилка генерації: ${data.message || 'Невідома помилка'}`
                    });
                }
            } catch (error) {
                console.error("Помилка мережі або сервера:", error);
            } finally {
                setIsLoadingCode(false);
            }
        }
    };

    const copyToClipboard = () => {
        if (joinCode) {
            navigator.clipboard.writeText(joinCode);
            setModalNotification({
                isOpen: true,
                title: "Успіх",
                message: "Код скопійовано в буфер обміну!"
            });
        }
    };

    const handleGoToControl = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/pages/family/${id}/control`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOwner) {
            onDelete?.(id);
        }
        setIsMenuOpen(false);
    };

    return (
        <>
            <div className={styles.card} onClick={onClick}>
                <div className={styles.menu_wrapper}>
                    <button className={styles.dots_button} onClick={toggleMenu}>
                        ⋮
                    </button>
                    
                    {isMenuOpen && (
                        <div className={styles.dropdown}>
                            <button onClick={openModal}>Приєднання</button>
                            {isOwner && (
                                <>
                                    <button onClick={handleGoToControl}>
                                        Керування
                                    </button>
                                    <button onClick={handleDelete} className={styles.delete_btn}>
                                        Видалити сім'ю
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <h3 className={styles.family_name_card}>{name}</h3>
                <p className={styles.member_count}>{count} членів</p>
                <span className={styles.role_badge}>{isOwner ? 'Власник' : 'Учасник'}</span>
            </div>

            {/* Модальне вікно приєднання */}
            {isModalOpen && (
                <div className={styles.modal_overlay} onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}>
                    <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modal_title}>Приєднання</h2>
                        
                        <div className={styles.code_section}>
                            <div className={styles.code_info}>
                                <span className={styles.code_label}>СТВОРЕНИЙ КОД:</span>
                                <span className={styles.generated_code}>
                                    {isLoadingCode ? 'Генерація...' : (joinCode || 'Помилка')}
                                </span>
                            </div>
                            <button 
                                className={styles.copy_btn} 
                                onClick={copyToClipboard}
                                disabled={!joinCode}
                            >
                                Скопіювати
                            </button>
                        </div>

                        <div className={styles.inputs_container}>
                            <div className={styles.select_box}>
                                <select className={styles.custom_input} defaultValue="">
                                    <option value="" disabled>Обрати роль</option>
                                    <option value="admin">Адміністратор</option>
                                    <option value="member">Учасник</option>
                                </select>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Введіть 6-значний код"
                                value={inputCode || ''}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                className={styles.custom_input} 
                            />
                        </div>

                        <button 
                            className={styles.btn_join}
                            onClick={handleJoinByCode}
                            disabled={isJoining || inputCode.length < 4}
                        >
                            {isJoining ? 'Приєднання...' : 'Приєднатися'}
                        </button>
                    </div>
                </div>
            )}

            {modalNotification && (
                <CustomModal
                    isOpen={modalNotification.isOpen}
                    title={modalNotification.title}
                    message={modalNotification.message}
                    onConfirm={() => setModalNotification(null)}
                    onCancel={() => setModalNotification(null)}
                />
            )}
        </>
    );
}