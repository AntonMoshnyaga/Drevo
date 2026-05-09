import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import styles from './style.module.css'; // Путь к твоим стилям

const Node2D = ({ data }: any) => {
    // Форматируем даты, если они есть
    const birth = data.birth_date ? data.birth_date.slice(0, 4) : '...';
    const death = data.death_date ? data.death_date.slice(0, 4) : '';
    const dateString = death ? `${birth} — ${death}` : birth;

    return (
        <div className={styles.custom_node_2d}>
            {/* Точки подключения связей */}
            <Handle type="target" position={Position.Top} className={styles.handle} />
            
            <div className={styles.node_card}>
                {/* Фотография или заглушка */}
                <div className={styles.node_photo_wrapper}>
                    {data.photo_url ? (
                        <img src={data.photo_url} alt={data.label} className={styles.node_image} />
                    ) : (
                        <div className={styles.node_photo_placeholder}>👤</div>
                    )}
                </div>

                {/* Инфо */}
                <div className={styles.node_info}>
                    <div className={styles.node_name}>{data.label}</div>
                    <div className={styles.node_date}>{dateString}</div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className={styles.handle} />
        </div>
    );
};

export default memo(Node2D);