'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import styles from './style.module.css';
import CustomModal from '@/app/component/CustomModal/CustomModal';

interface Member {
    account_id: number;
    name: string;
    email: string;
    role_id: number;
    role_name: string;
}

interface Invite {
    id: number;
    code: string;
    role_id: number;
    expiry_date: string;
}

export default function FamilyControlPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [members, setMembers] = useState<Member[]>([]);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFamilyData = async () => {
            if (!id || !user?.id) return;
            
            try {
                const response = await fetch(`/api/family/control?familyId=${id}&accountId=${user.id}`);
                const data = await response.json();

                if (response.ok) {
                    setMembers(data.members || []);
                    setInvites(data.invites || []);
                } else {
                    setError(data.message || 'Помилка завантаження даних');
                }
            } catch (err) {
                console.error(err);
                setError('Помилка сервера');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFamilyData();
    }, [id, user]);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const closeModal = () => setModalConfig(null);

    const handleRemoveMember = (targetAccountId: number) => {
        setModalConfig({
            isOpen: true,
            title: "Видалення учасника",
            message: "Ви впевнені, що хочете видалити цього учасника з родини?",
            onConfirm: () => executeRemoveMember(targetAccountId)
        });
    };

    const executeRemoveMember = async (targetAccountId: number) => {
        closeModal();
        try {
            const res = await fetch('/api/user/remove', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ familyId: id, accountId: targetAccountId, requesterId: user?.id })
            });

            if (res.ok) {
                setMembers(prev => prev.filter(m => m.account_id !== targetAccountId));
                setModalConfig({
                    isOpen: true,
                    title: "Успіх",
                    message: "Учасника успішно видалено.",
                    onConfirm: closeModal
                });
            } else {
                const data = await res.json();
                setModalConfig({
                    isOpen: true,
                    title: "Помилка",
                    message: data.error || 'Помилка при видаленні учасника',
                    onConfirm: closeModal
                });
            }
        } catch (error) {
            console.error('Помилка:', error);
        }
    };

    const handleRevokeInvite = (inviteId: number) => {
        setModalConfig({
            isOpen: true,
            title: "Скасування коду",
            message: "Видалити цей код запрошення? Він більше не працюватиме.",
            onConfirm: () => executeRevokeInvite(inviteId)
        });
    };

    const executeRevokeInvite = async (inviteId: number) => {
        closeModal();
        try {
            const res = await fetch('/api/family/invate/revoke', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteId, familyId: id, requesterId: user?.id })
            });

            if (res.ok) {
                setInvites(prev => prev.filter(inv => inv.id !== inviteId));
            } else {
                const data = await res.json();
                setModalConfig({
                    isOpen: true,
                    title: "Помилка",
                    message: data.error || 'Помилка при видаленні коду',
                    onConfirm: closeModal
                });
            }
        } catch (error) {
            console.error('Помилка:', error);
        }
    };

    if (isLoading) return <div className={styles.loading}>Завантаження...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.page_container}>
            {modalConfig && (
                <CustomModal 
                    isOpen={modalConfig.isOpen}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    onConfirm={modalConfig.onConfirm}
                    onCancel={closeModal}
                />
            )}
            <header className={styles.header}>
                <button className={styles.back_btn} onClick={() => router.back()}>
                    ← Назад
                </button>
                <h2 className={styles.title}>Керування сім'єю</h2>
            </header>

            <main className={styles.content}>
                <section className={styles.section}>
                    <h3 className={styles.section_title}>Учасники ({members.length})</h3>
                    <div className={styles.list}>
                        {members.length === 0 ? (
                            <p className={styles.empty_msg}>Немає учасників</p>
                        ) : (
                            members.map(member => (
                                <div key={member.account_id} className={styles.card_item}>
                                    <div className={styles.info}>
                                        <span className={styles.name}>{member.name}</span>
                                        <span className={styles.email}>{member.email}</span>
                                        <span className={styles.role_badge}>
                                            {member.role_id === 1 ? 'Власник' : 'Учасник'}
                                        </span>
                                    </div>
                                    
                                    {member.account_id !== user?.id && (
                                        <button 
                                            className={styles.delete_btn}
                                            onClick={() => handleRemoveMember(member.account_id)}
                                        >
                                            Видалити
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <hr className={styles.divider} />

                <section className={styles.section}>
                    <h3 className={styles.section_title}>Активні коди приєднання</h3>
                    <div className={styles.list}>
                        {invites.length === 0 ? (
                            <p className={styles.empty_msg}>Активних кодів немає</p>
                        ) : (
                            invites.map(invite => (
                                <div key={invite.id} className={styles.card_item}>
                                    <div className={styles.info}>
                                        <span className={styles.code_text}>{invite.code}</span>
                                        <span className={styles.date}>
                                            Термін дії: {new Date(invite.expiry_date).toLocaleString('uk-UA')}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.delete_btn}
                                        onClick={() => handleRevokeInvite(invite.id)}
                                    >
                                        Анулювати
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}