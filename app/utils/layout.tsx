import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
    // Укажите примерные размеры ваших карточек, чтобы алгоритм оставлял правильные отступы
    const nodeWidth = 200; 
    const nodeHeight = 150;

    // TB = Top to Bottom (Сверху вниз)
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Запускаем просчет алгоритма
    dagre.layout(dagreGraph);

    // Возвращаем узлы с новыми координатами
    return nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });
};