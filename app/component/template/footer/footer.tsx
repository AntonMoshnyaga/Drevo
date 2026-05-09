import styles from "./style.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer_container}>
                    <h4 className={styles.h4}>
                        © Drevo 2026. Усі права захищені
                    </h4>
            </div>
        </footer>
    );
}