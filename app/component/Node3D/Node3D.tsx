'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Text, Image as DreiImage, MeshDistortMaterial, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useDrag } from '@use-gesture/react'; // Додаємо імпорт

// 1. Оновлений інтерфейс
interface Node3DProps {
    id: string; // Обов'язково додаємо ID для ідентифікації при перетягуванні
    position: [number, number, number];
    label: string;
    photo_url?: string | null;
    gender?: string;
    birth_date?: string;
    onClick?: () => void;
    onNodeDrag?: (id: string, x: number, y: number) => void;
    onNodeDragStart: () => void;
}

export function Node3D({ id, position, label, photo_url, gender, birth_date, onClick, onNodeDrag, onNodeDragStart }: Node3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Отримуємо параметри камери та екрану для правильного прорахунку координат
    const { viewport, size } = useThree();
    const aspect = viewport.width / size.width;

    const baseColor = useMemo(() => {
        if (gender === 'Чоловіча') return '#2c3e50';
        if (gender === 'Жіноча') return '#8e44ad';
        return '#171717';
    }, [gender]);

    const displayDate = birth_date ? birth_date.slice(0, 10) : '';

    // Логіка перетягування
    const bind = useDrag(({ movement: [mx, my], last, first, event }) => {
        event.stopPropagation();

        if (first && onNodeDragStart) {
            onNodeDragStart();
        }
        
        // Оновлюємо стейт лише коли користувач відпустив кнопку миші
        if (last && onNodeDrag) {
            const newX = position[0] + (mx * aspect);
            const newY = position[1] - (my * aspect); // мінус, бо вісь Y в 3D інвертована
            onNodeDrag(id, newX, newY);
        }
    });

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (groupRef.current) {
            // Плавання буде працювати навколо нової позиції position[1]
            groupRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.1;
            // Оновлюємо X також, на випадок якщо ми його перетягнули
            groupRef.current.position.x = position[0]; 
        }
        if (meshRef.current && hovered) {
            meshRef.current.rotation.y += 0.02;
        }
    });

    return (
        // 2. Додаємо {...bind()} до головної групи
        <group ref={groupRef} position={position} {...bind()}>
            <Sphere 
                ref={meshRef} 
                args={[0.6, 64, 64]} 
                onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                }}
            >
                <MeshDistortMaterial 
                    color={hovered ? '#AD9561' : baseColor} 
                    speed={hovered ? 3 : 0} 
                    distort={0.3} 
                    metalness={0.8} 
                    roughness={0.2} 
                />
            </Sphere>

            <Billboard follow={true}>
                {photo_url && (
                    <DreiImage
                        url={photo_url}
                        position={[0, 0, 0.7]} 
                        scale={[0.85, 0.85]}
                        transparent
                        renderOrder={1}
                        radius={0.5}
                        material-depthWrite={false}
                        material-side={THREE.DoubleSide}
                    />
                )}

                <group position={[0, -1.1, 0.1]}>
                    <Text
                        fontSize={0.22}
                        color={hovered ? '#AD9561' : 'black'}
                        anchorX="center"
                        renderOrder={2}
                        outlineWidth={0.015}
                        outlineColor={hovered ? '#000000' : '#ffffff'}
                    >
                        {label}
                    </Text>
                    {displayDate && (
                        <Text
                            position={[0, -0.22, 0]}
                            fontSize={0.14}
                            color="#666"
                            anchorX="center"
                            renderOrder={2}
                        >
                            {displayDate}
                        </Text>
                    )}
                </group>
            </Billboard>
        </group>
    );
}