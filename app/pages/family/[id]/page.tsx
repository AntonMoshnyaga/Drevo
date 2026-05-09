'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import ReactFlow, { applyNodeChanges, OnNodesChange, Background, Controls, Node, Edge, addEdge, Connection } from 'reactflow';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import 'reactflow/dist/style.css';
import Image from 'next/image';
import styles from './style.module.css';
import { Node3D } from '../../../component/Node3D/Node3D';
import Node2D from '../../../component/Node2D/Node2D';

export default function FamilyPage() {
    const params = useParams();
    const familyId = params.id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', gender: 'Чоловіча', birthDate: '', deathDate: '', photoUrl: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const nodeTypes = {
        familyNode: Node2D,
    };

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const handle3DNodeDrag = useCallback((id: string, newX: number, newY: number) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        position: { x: newX * 100, y: -newY * 100 },
                    };
                }
                return node;
            })
        );
        // Когда движение окончено, разрешаем камере снова двигаться
        setIsDragging(false);
    }, [setNodes]);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        
        // Шукаємо член родини без урахування регістру
        const foundNode = nodes.find(node => 
            node.data.label.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (foundNode) {
            onNodeClick(null, foundNode); // Відкриваємо інфо в правому сайдбарі
            setSearchQuery(''); // Очищаємо поле (опціонально)
        } else {
            alert('Члена родини не знайдено');
        }
    };

    const onConnect = useCallback(async (params: Connection) => {
        const { source, target } = params;

        // 1. Базова валідація
        if (source === target) return; 

        // Перевірка на циклічність (дитина не може бути батьком власного батька)
        const isCyclic = edges.some(edge => edge.source === target && edge.target === source);
        if (isCyclic) {
            alert("Помилка: неможливо створити циклічний зв'язок!");
            return;
        }

        try {
            // 2. Запит до API
            const response = await fetch('/api/family/relationships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parent_id: source,
                    child_id: target,
                    relation_type: 'biological' 
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Server error");
            }

            // 3. Візуальне оновлення графа
            setEdges((eds) => addEdge({
                ...params,
                id: `e-${source}-${target}`, 
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#AD9561', strokeWidth: 2 }
            }, eds));
            
        } catch (error: any) {
            console.error("Помилка створення зв'язку:", error);
            alert(error.message || "Не вдалося зберегти зв'язок.");
        }
    }, [edges, setEdges]);

    const handleDeleteMember = async () => {
        if (!selectedMember?.id) return;
        
        if (!window.confirm(`Видалити ${selectedMember.label}?`)) return;

        try {
            const response = await fetch('/api/family/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Передаємо ID у форматі JSON
                body: JSON.stringify({ id: selectedMember.id })
            });

            if (response.ok) {
                setNodes((nds) => nds.filter((node) => node.id !== selectedMember.id));
                setEdges((eds) => eds.filter((edge) => edge.source !== selectedMember.id && edge.target !== selectedMember.id));
                setSelectedMember(null);
                setIsSidebarOpen(false);
            }
        } catch (error) {
            console.error("Помилка під час запиту:", error);
        }
    };

    const fetchTree = useCallback(async () => {
        try {
            const res = await fetch(`/api/family/tree?familyId=${familyId}`);
            const data = await res.json();
            if (res.ok) {
                setNodes(data.nodes);
                setEdges(data.edges);
            }
        } catch (err) {
            console.error("Помилка завантаження", err);
        } finally {
            setLoading(false);
        }
    }, [familyId]);

    useEffect(() => {
        if (familyId) fetchTree();
    }, [familyId, fetchTree]);

    // Логіка завантаження фото (конвертація в Base64 для простоти збереження)
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const onNodeClick = (_: any, node: Node) => {
        setSelectedMember({ ...node.data, id: node.id });
        setIsAdding(false);
        setIsEditing(false);
        setIsSidebarOpen(true);
    };

    const handleEditClick = () => {
        if (!selectedMember) return;
        
        // Заповнюємо форму існуючими даними
        setFormData({
            name: selectedMember.label || '',
            gender: selectedMember.gender === 1 ? 'Чоловіча' : 'Жіноча',
            birthDate: selectedMember.birth_date || '',
            deathDate: selectedMember.death_date || '',
            photoUrl: selectedMember.photo_url || ''
        });
        
        setIsEditing(true);
    };

    const handleSaveMember = async () => {
        if (!formData.name) return alert("Вкажіть ім'я");
        
        // Визначаємо URL та метод залежно від того, додаємо ми чи редагуємо
        const endpoint = isEditing ? '/api/family/member/update' : '/api/family/member/create';
        const method = isEditing ? 'PUT' : 'POST';
        
        // Якщо редагуємо, обов'язково передаємо ID людини
        const payload = isEditing 
            ? { ...formData, id: selectedMember.id, familyId } 
            : { ...formData, familyId };

            console.log("Відправляємо дані:", payload);

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            
            if (res.ok) {
                setIsAdding(false);
                setIsEditing(false);
                fetchTree(); // Оновлюємо дерево
            } else {
                alert(`Помилка: ${data.message || 'Невідома помилка'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Помилка з'єднання");
        }
    };

    const processedNodes = useMemo(() => {
        return nodes.map((node) => ({
            ...node,
            type: 'familyNode',
        }));
    }, [nodes]);

    if (loading) return <div className={styles.loader}>Вирощуємо дерево...</div>;

    return (
        <div className={`${styles.page_layout} ${!isSidebarOpen ? styles.sidebar_closed : ''}`}>
            {/* Лівий сайдбар */}
            <aside className={styles.sidebar_left}>
                <div className={styles.logo_box}>
                    <div className={styles.burger_black} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</div>
                </div>
                
                <div className={styles.controls_group}>
                    
                    <div className={styles.search_block}>
                        <input 
                            type="text" 
                            placeholder="Знайти ім'я..." 
                            className={styles.themed_input}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className={styles.themed_btn} onClick={handleSearch} style={{ width: '100%' }}>
                            Знайти
                        </button>
                    </div>

                    <button className={styles.themed_btn} onClick={() => { setIsAdding(true); setIsSidebarOpen(true); setSelectedMember(null); }} style={{ width: '100%' }}>
                        Додати
                    </button>
                    <button className={styles.themed_btn} onClick={() => setViewMode(prev => prev === '2D' ? '3D' : '2D')} style={{ width: '100%' }}>
                        {viewMode === '2D' ? '3D Вигляд' : '2D Вигляд'}
                    </button>

                    {!isAdding && !isEditing && selectedMember && (
                        <div className={styles.action_buttons}>
                            <button className={styles.themed_btn} onClick={handleEditClick}>Редагувати</button>
                            <button 
                                className={styles.themed_btn} 
                                style={{ background: '#7a2020', borderColor: '#ff4d4d', color: 'white' }} 
                                onClick={handleDeleteMember}
                            >
                                Видалити
                            </button>
                        </div>
                    )}

                    <div className={styles.connections_block}>
                        <h4 className={styles.themed_title_small}>Зв'язки</h4>
                        
                        <ul className={styles.connections_list}>
                            {edges.length > 0 ? (
                                edges.map((edge, index) => (
                                    <li key={index} className={styles.connection_item}>
                                        Зв'язок #{index + 1}
                                    </li>
                                ))
                            ) : (
                                <li className={styles.empty_text}>Немає зв'язків</li>
                            )}
                        </ul>
                    </div>
                    
                </div>
            </aside>

            {/* Основна область */}
            <main className={styles.tree_area}>
                <div className={styles.canvas_wrapper}>
                    {viewMode === '2D' ? (
                    <ReactFlow 
                        nodes={processedNodes} 
                        edges={edges} 
                        onNodesChange={onNodesChange}
                        onNodeClick={onNodeClick} 
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background color="#AD9561" gap={20} />
                        <Controls />
                    </ReactFlow>
                    ) : (
                        <Canvas camera={{ position: [0, 0, 10] }}>
                            <ambientLight intensity={0.8} />
                            <pointLight position={[10, 10, 10]} />
                            <OrbitControls makeDefault enabled={!isDragging} />
                            {nodes.map((node) => (
                                <Node3D 
                                    key={node.id} 
                                    id={node.id}
                                    position={[node.position.x / 100, -node.position.y / 100, 0]} 
                                    label={node.data.label}
                                    photo_url={node.data.photo_url} 
                                    gender={node.data.gender === 1 ? 'Чоловіча' : 'Жіноча'}
                                    birth_date={node.data.birth_date}
                                    onClick={() => onNodeClick(null, node)}
                                    onNodeDragStart={() => setIsDragging(true)} 
                                    onNodeDrag={handle3DNodeDrag}
                                />
                            ))}
                        </Canvas>
                    )}
                </div>
            </main>

            {/* Правий сайдбар */}
            {isSidebarOpen && (
                <aside className={styles.sidebar_right}>
                    <div className={styles.info_header}>
                            <div className={styles.burger_black} onClick={() => setIsSidebarOpen(false)}>☰</div>
                            <h3 className={styles.themed_title}>
                                {isAdding ? 'Новий родич' : isEditing ? 'Редагування' : 'Інфо'}
                            </h3>
                            
                            {/* Кнопка редагування показується тільки якщо це режим "Інфо" і обрано людину */}
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
                                {/* Фото можна змінювати як при додаванні, так і при редагуванні */}
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
                        {/* Ім'я */}
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

                        {/* Стать */}
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

                        {/* Дата народження */}
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

                        {/* Дата смерті */}
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

                        {/* Кнопки збереження/скасування */}
                        {(isAdding || isEditing) && (
                            <div className={styles.btn_container}>
                                <button className={styles.themed_btn} onClick={handleSaveMember}>Зберегти</button>
                                <button className={styles.themed_btn} style={{background: '#333'}} onClick={() => {
                                    setIsAdding(false);
                                    setIsEditing(false);
                                }}>Відміна</button>
                            </div>
                        )}
                    </div>
                </aside>
            )}
        </div>
    );
}