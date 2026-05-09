import styles from './style.module.css';

interface FamilyCardProps {
    name: string;
    count: number;
    onClick?: () => void; // Додаємо необов'язковий пропс для кліку
}

export default function FamilyCard({ name, count, onClick }: FamilyCardProps) {
    return (
        <div 
            className={styles.card} 
            onClick={onClick}
            role="button" // Для доступності (A11y)
            tabIndex={0}  // Дозволяє фокусуватися клавіатурою
        >
            <h3 className={styles.family_name}>{name}</h3>
            <p className={styles.member_count}>{count} членів</p>
        </div>
    );
}