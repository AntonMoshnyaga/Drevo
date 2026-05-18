import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Node, Edge } from 'reactflow';
import { Node3D } from '../Node3D/Node3D';
import Edge3D from '../Edge3D/Edge3D';

interface TreeView3DProps {
    processedNodes: Node[];
    edges: Edge[];
    isDragging: boolean;
    setIsDragging: (dragging: boolean) => void;
    handle3DNodeDrag: (id: string, newX: number, newY: number) => void;
    onNodeClick: (event: any, node: Node) => void;
}

export default function TreeView3D({
    processedNodes,
    edges,
    isDragging,
    setIsDragging,
    handle3DNodeDrag,
    onNodeClick
}: TreeView3DProps) {
    return (
        <Canvas camera={{ position: [0, 0, 10] }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls makeDefault enabled={!isDragging} />
            
            {edges.map((edge) => {
                const sourceNode = processedNodes.find(n => String(n.id) === String(edge.source));
                const targetNode = processedNodes.find(n => String(n.id) === String(edge.target));

                if (!sourceNode || !targetNode) return null;

                const startPosition: [number, number, number] = [sourceNode.position.x / 100, -sourceNode.position.y / 100, 0];
                const endPosition: [number, number, number] = [targetNode.position.x / 100, -targetNode.position.y / 100, 0];

                return (
                    <Edge3D 
                        key={edge.id || `edge-${edge.source}-${edge.target}`} 
                        start={startPosition} 
                        end={endPosition} 
                    />
                );
            })}

            {processedNodes.map((node) => (
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
    );
}