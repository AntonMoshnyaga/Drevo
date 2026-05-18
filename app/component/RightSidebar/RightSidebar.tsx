import React, { RefObject } from 'react';
import Image from 'next/image';
import styles from './style.module.css';

interface RightSidebarProps {
    isAdding: boolean;
    isEditing: boolean;
    setIsAdding: (adding: boolean) => void;
    setIsEditing: (editing: boolean) => void;
    selectedMember: any;
    handleEditClick: () => void;
    formData: { name: string; gender: string; birthDate: string; deathDate: string; photoUrl: string };
    setFormData: React.Dispatch<React.SetStateAction<{ name: string; gender: string; birthDate: string; deathDate: string; photoUrl: string }>>;
    fileInputRef: RefObject<HTMLInputElement | null>;
    handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSaveMember: () => void;
    setIsSidebarOpen: (open: boolean) => void;
    isSidebarOpen?: boolean; 
}

export default function RightSidebar({
    isAdding,
    isEditing,
    setIsAdding,
    setIsEditing,
    selectedMember,
    handleEditClick,
    formData,
    setFormData,
    fileInputRef,
    handlePhotoUpload,
    handleSaveMember,
    setIsSidebarOpen,
    isSidebarOpen = true
}: RightSidebarProps) {

    const onSave = () => {
        handleSaveMember();
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    const onCancel = () => {
        setIsAdding(false);
        setIsEditing(false);
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <>
            {isSidebarOpen && (
                <div className={styles.sidebar_right_overlay} onClick={() => setIsSidebarOpen(false)} />
            )}

            <aside className={`${styles.sidebar_right} ${isSidebarOpen ? styles.open : ''}`}>
                <div className={styles.info_header}>
                    <div className={styles.burger_black} onClick={() => setIsSidebarOpen(false)}>✕</div>
                    <h3 className={styles.themed_title}>
                        {isAdding ? 'Новий родич' : isEditing ? 'Редагування' : 'Інфо'}
                    </h3>
                    
                    {!isAdding && !isEditing && selectedMember && (
                        <Image 
                            src="/edit.svg" 
                            alt="Edit" 
                            width={20} 
                            height={20} 
                            className={styles.themed_icon} 
                            onClick={handleEditClick} 
                        />
                    )}
                </div>

                <div className={styles.photo_section}>
                    {(isAdding || isEditing) ? (
                        <div className={styles.photo_upload_area} onClick={() => fileInputRef.current?.click()}>
                            {formData.photoUrl ? (
                                <img src={formData.photoUrl} alt="Preview" className={styles.sidebar_img} />
                            ) : (
                                <span>Завантажити фото</span>
                            )}
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                    ) : (
                        <div className={styles.photo_display}>
                            {selectedMember?.photo_url ? (
                                <img src={selectedMember.photo_url} alt="Member" className={styles.sidebar_img} />
                            ) : (
                                <span className={styles.themed_label}>Немає фото</span>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.details_form}>
                    <div className={styles.detail_item}>
                        <span className={styles.themed_label}>Ім’я</span>
                        <input 
                            className={styles.themed_input}
                            type="text" 
                            readOnly={!isAdding && !isEditing}
                            value={(isAdding || isEditing) ? formData.name : (selectedMember?.label || '')} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className={styles.detail_item}>
                        <span className={styles.themed_label}>Стать</span>
                        {(isAdding || isEditing) ? (
                            <select className={styles.themed_input} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                <option value="Чоловіча">Чоловіча</option>
                                <option value="Жіноча">Жіноча</option>
                            </select>
                        ) : (
                            <input className={styles.themed_input} type="text" readOnly value={selectedMember?.gender === 1 ? 'Чоловіча' : 'Жіноча'} />
                        )}
                    </div>

                    <div className={styles.detail_item}>
                        <span className={styles.themed_label}>Народився</span>
                        <input 
                            className={styles.themed_input}
                            type={(isAdding || isEditing) ? "date" : "text"} 
                            readOnly={!isAdding && !isEditing}
                            value={(isAdding || isEditing) ? formData.birthDate : (selectedMember?.birth_date?.slice(0, 10) || '')} 
                            onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        />
                    </div>

                    {(isAdding || isEditing || selectedMember?.death_date) && (
                        <div className={styles.detail_item}>
                            <span className={styles.themed_label}>Помер</span>
                            <input 
                                className={styles.themed_input}
                                type={(isAdding || isEditing) ? "date" : "text"} 
                                readOnly={!isAdding && !isEditing}
                                value={(isAdding || isEditing) ? formData.deathDate : (selectedMember?.death_date?.slice(0, 10) || '')} 
                                onChange={e => setFormData({...formData, deathDate: e.target.value})}
                            />
                        </div>
                    )}

                    {(isAdding || isEditing) && (
                        <div className={styles.btn_container}>
                            <button className={styles.themed_btn} onClick={onSave}>Зберегти</button>
                            <button className={styles.themed_btn} style={{background: '#333'}} onClick={onCancel}>Відміна</button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}