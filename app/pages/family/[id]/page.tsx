'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { applyNodeChanges, OnNodesChange, Node, Edge, addEdge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import styles from './style.module.css';
import Node2D from '../../../component/Node2D/Node2D';
import CustomModal from '@/app/component/CustomModal/CustomModal';

import { getLayoutedElements } from '../../../utils/layout';
import LeftSidebar from '../../../component/LeftSidebar/LeftSidebar';
import RightSidebar from '../../../component/RightSidebar/RightSidebar';
import TreeView2D from '../../../component/TreeView2D/TreeView2D';
import TreeView3D from '../../../component/TreeView3D/TreeView3D';

export default function FamilyPage() {
    const params = useParams();
    const familyId = params.id;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

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

    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);

    const nodeTypes = useMemo(() => ({ familyNode: Node2D }), []);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const handle3DNodeDrag = useCallback((id: string, newX: number, newY: number) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, position: { x: newX * 100, y: -newY * 100 } };
                }
                return node;
            })
        );
        setIsDragging(false);
    }, [setNodes]);

    const showModal = (title: string, message: string) => {
        setModalConfig({ isOpen: true, title, message });
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        const foundNode = nodes.find(node => node.data.label.toLowerCase().includes(searchQuery.toLowerCase()));
        if (foundNode) {
            onNodeClick(null, foundNode);
            setSearchQuery('');
        } else {
            showModal("Помилка", "Члена родини не знайдено");
        }
    };

    const onConnect = useCallback(async (params: Connection) => {
        const { source, target } = params;
        if (source === target) return; 

        const isCyclic = edges.some(edge => edge.source === target && edge.target === source);
        if (isCyclic) {
            showModal("Помилка", "Помилка: неможливо створити циклічний зв'язок!");
            return;
        }

        try {
            const response = await fetch('/api/family/relationships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parent_id: source, child_id: target, relation_type: 'biological' })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Server error");
            }

            setEdges((eds) => addEdge({
                ...params,
                id: `e-${source}-${target}`, 
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#AD9561', strokeWidth: 2 }
            }, eds));
        } catch (error: any) {
            console.error("Помилка створення зв'язку:", error);
            showModal("Помилка", error.message || "Не вдалося зберегти зв'язок.");
        }
    }, [edges, setEdges]);

    const getPersonName = (id: string) => {
        const node = nodes.find(n => n.id === id || String(n.id) === String(id));
        return node?.data?.label || 'Невідомий';
    };

    const handleDeleteMember = async () => {
        if (!selectedMember?.id) return;
        if (!window.confirm(`Видалити ${selectedMember.label}?`)) return;

        try {
            const response = await fetch('/api/family/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
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

    const onEdgeClick = useCallback(async (event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        if (!window.confirm("Ви дійсно хочете видалити цей зв'язок?")) return;

        try {
            const response = await fetch('/api/family/relationships', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parent_id: edge.source, child_id: edge.target })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Не вдалося видалити зв'язок на сервері");
            }

            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        } catch (error: any) {
            console.error("Помилка видалення:", error);
            showModal("Помилка", error.message || "Сталася помилка при видаленні зв'язку.");
        }
    }, [setEdges]);

    const fetchTree = useCallback(async () => {
        if (!familyId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/family/tree?familyId=${familyId}`);
            if (res.status === 403) {
                router.push('/pages/main');
                return;
            }
            if (!res.ok) throw new Error('Помилка завантаження');

            const data = await res.json();
            const { layoutedNodes, layoutedEdges } = getLayoutedElements(data.nodes || [], data.edges || []);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        } catch (err) {
            console.error("Помилка завантаження:", err);
        } finally {
            setLoading(false);
        }
    }, [familyId, router]); 

    useEffect(() => {
        fetchTree();
    }, [fetchTree]);

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
        if (!formData.name) {
            showModal("Помилка", "Вкажіть ім'я");
            return;
        }
        
        const endpoint = isEditing ? '/api/family/member/update' : '/api/family/member/create';
        const method = isEditing ? 'PUT' : 'POST';
        const payload = isEditing ? { ...formData, id: selectedMember.id, familyId } : { ...formData, familyId };

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
                fetchTree();
            } else {
                showModal("Помилка", `Помилка: ${data.message || 'Невідома помилка'}`);
            }
        } catch (err) {
            console.error(err);
            showModal("Помилка", "Помилка з'єднання");
        }
    };

    const processedNodes = useMemo(() => {
        return nodes.map((node) => ({ ...node, type: 'familyNode' }));
    }, [nodes]);

    if (loading) return <div className={styles.loader}>Вирощуємо дерево...</div>;

    return (
        <div className={`${styles.page_layout} ${!isSidebarOpen ? styles.sidebar_closed : ''}`}>
            
            {isSidebarOpen && (
                <div 
                    className={styles.mobile_backdrop} 
                    onClick={() => setIsSidebarOpen(false)} 
                />
            )}

            <LeftSidebar 
                isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch}
                setIsAdding={setIsAdding} setSelectedMember={setSelectedMember}
                viewMode={viewMode} setViewMode={setViewMode} selectedMember={selectedMember}
                handleEditClick={handleEditClick} handleDeleteMember={handleDeleteMember}
                edges={edges} getPersonName={getPersonName}
            />

            <main className={styles.tree_area}>
                {!isSidebarOpen && (
                    <button 
                        className={styles.floating_burger} 
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        ☰
                    </button>
                )}
                
                <div className={styles.canvas_wrapper}>
                    {viewMode === '2D' ? (
                        <TreeView2D 
                            processedNodes={processedNodes} edges={edges} nodeTypes={nodeTypes}
                            onNodesChange={onNodesChange} onNodeClick={onNodeClick}
                            onConnect={onConnect} onEdgeClick={onEdgeClick}
                        />
                    ) : (
                        <TreeView3D 
                            processedNodes={processedNodes} edges={edges} isDragging={isDragging}
                            setIsDragging={setIsDragging} handle3DNodeDrag={handle3DNodeDrag} onNodeClick={onNodeClick}
                        />
                    )}
                </div>
            </main>

            {isSidebarOpen && (
                <RightSidebar 
                    isAdding={isAdding} isEditing={isEditing} setIsAdding={setIsAdding} setIsEditing={setIsEditing}
                    selectedMember={selectedMember} handleEditClick={handleEditClick}
                    formData={formData} setFormData={setFormData} fileInputRef={fileInputRef}
                    handlePhotoUpload={handlePhotoUpload} handleSaveMember={handleSaveMember} setIsSidebarOpen={setIsSidebarOpen}
                />
            )}

            {modalConfig?.isOpen && (
                <CustomModal 
                    isOpen={modalConfig.isOpen} 
                    title={modalConfig.title} 
                    message={modalConfig.message} 
                    onConfirm={() => setModalConfig(null)} 
                    onCancel={() => setModalConfig(null)} 
                />
            )}
        </div>
    );
}