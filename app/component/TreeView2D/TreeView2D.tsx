import React from 'react';
import ReactFlow, { Background, Controls, Node, Edge, OnNodesChange, Connection } from 'reactflow';

interface TreeView2DProps {
    processedNodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onNodeClick: (event: React.MouseEvent, node: Node) => void;
    onConnect: (params: Connection) => void;
    onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
    nodeTypes: any;
}

export default function TreeView2D({
    processedNodes,
    edges,
    onNodesChange,
    onNodeClick,
    onConnect,
    onEdgeClick,
    nodeTypes
}: TreeView2DProps) {
    return (
        <ReactFlow 
            nodes={processedNodes} 
            edges={edges} 
            onNodesChange={onNodesChange}
            onNodeClick={onNodeClick} 
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
        >
            <Background color="#AD9561" gap={20} />
            <Controls />
        </ReactFlow>
    );
}