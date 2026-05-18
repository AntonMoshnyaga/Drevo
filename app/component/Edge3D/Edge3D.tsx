import { Line } from '@react-three/drei';

const Edge3D = ({ start, end }: { start: [number, number, number], end: [number, number, number] }) => {
    return (
        <Line
            points={[start, end]}
            color="#AD9561"
            lineWidth={3}
            dashed={false}
        />
    );
};

export default Edge3D;