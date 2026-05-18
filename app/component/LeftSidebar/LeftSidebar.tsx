import React from 'react';
import styles from './style.module.css';
import { Edge } from 'reactflow';

interface LeftSidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSearch: () => void;
    setIsAdding: (adding: boolean) => void;
    setSelectedMember: (member: any) => void;
    viewMode: '2D' | '3D';
    setViewMode: (mode: '2D' | '3D') => void;
    selectedMember: any;
    handleEditClick: () => void;
    handleDeleteMember: () => void;
    edges: Edge[];
    getPersonName: (id: string) => string;
}

export default function LeftSidebar({
    isSidebarOpen,
    setIsSidebarOpen,
    searchQuery,
    setSearchQuery,
    handleSearch,
    setIsAdding,
    setSelectedMember,
    viewMode,
    setViewMode,
    selectedMember,
    handleEditClick,
    handleDeleteMember,
    edges,
    getPersonName
}: LeftSidebarProps) {

    const onSearchClick = () => {
        handleSearch();
        if (window.innerWidth <= 768) setIsSidebarOpen(false);
    };

    return (
        <>
            {!isSidebarOpen && (
                <button className={styles.mobile_burger} onClick={() => setIsSidebarOpen(true)}>
                    ☰
                </button>
            )}
            
            {isSidebarOpen && (
                <div className={styles.sidebar_overlay} onClick={() => setIsSidebarOpen(false)} />
            )}

            <aside className={`${styles.sidebar_left} ${isSidebarOpen ? styles.open : ''}`}>
                <div className={styles.logo_box}>
                    <div className={styles.burger_black} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? '✕' : '☰'}
                    </div>
                </div>
                
                <div className={styles.controls_group}>
                    <div className={styles.search_block}>
                        <input 
                            type="text" 
                            placeholder="Знайти ім'я..." 
                            className={styles.themed_input}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSearchClick()}
                        />
                        <button className={styles.themed_btn} onClick={onSearchClick} style={{ width: '100%' }}>
                            Знайти
                        </button>
                    </div>

                    <button 
                        className={styles.themed_btn} 
                        onClick={() => { 
                            setIsAdding(true); 
                            setSelectedMember(null); 
                            if (window.innerWidth <= 768) setIsSidebarOpen(false);
                        }} 
                        style={{ width: '100%' }}
                    >
                        Додати
                    </button>
                    <button 
                        className={styles.themed_btn} 
                        onClick={() => {
                            setViewMode(viewMode === '2D' ? '3D' : '2D');
                            if (window.innerWidth <= 768) setIsSidebarOpen(false);
                        }} 
                        style={{ width: '100%' }}
                    >
                        {viewMode === '2D' ? '3D Вигляд' : '2D Вигляд'}
                    </button>

                    {selectedMember && (
                        <div className={styles.action_buttons}>
                            <button 
                                className={styles.themed_btn} 
                                onClick={() => { handleEditClick(); if (window.innerWidth <= 768) setIsSidebarOpen(false); }}
                            >
                                Редагувати
                            </button>
                            <button 
                                className={styles.themed_btn} 
                                style={{ background: '#7a2020', borderColor: '#ff4d4d', color: 'white' }} 
                                onClick={() => { handleDeleteMember(); if (window.innerWidth <= 768) setIsSidebarOpen(false); }}
                            >
                                Видалити
                            </button>
                        </div>
                    )}

                    <div className={styles.connections_block}>
                        <h4 className={styles.themed_title_small}>Зв'язки</h4>
                        <ul className={styles.connections_list}>
                            {edges.length > 0 ? (
                                edges.map((edge: any, index) => {
                                    const sourceId = edge.source || edge.parent_id;
                                    const targetId = edge.target || edge.child_id;
                                    const relType = edge.relation_type || edge.data?.type || 'Зв’язок';

                                    return (
                                        <li key={index} className={styles.connection_item}>
                                            <strong>{getPersonName(sourceId)}</strong> 
                                            <span className={styles.relation_arrow}> → </span> 
                                            <strong>{getPersonName(targetId)}</strong>
                                            <div className={styles.relation_type}>{relType}</div>
                                        </li>
                                    );
                                })
                            ) : (
                                <li className={styles.empty_text}>Немає зв'язків</li>
                            )}
                        </ul>
                    </div>
                </div>
            </aside>
        </>
    );
}