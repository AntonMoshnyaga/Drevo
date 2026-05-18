import Image from "next/image";
import styles from "./style.module.css";
import Button from "../../component/button/button";

export default function AboutPage() {
    return (
    <main className={styles.main}>
    
        <section className={styles.section_light}>
        <div className={styles.container}>
            <div className={styles.hero_grid}>
            <div className={styles.hero_content}>
                <div className={styles.title_group}>
                <h1 className="text-3xl md:text-4xl uppercase leading-tight">Навіщо створювати<br/>родинне дерево?</h1>
                <span className={styles.underline}></span>
                </div>
                <p className="mb-6 opacity-90">
                У світі, де інформація швидко зникає, важливо зберегти те, що має значення.
                </p>
                <ul className={styles.hero_list}>
                <li>Відкрийте історію свого роду</li>
                <li>Збережіть спогади та важливі події</li>
                <li>Передайте знання наступним поколінням</li>
                <li>Створіть єдине місце для всієї родини</li>
                </ul>
                <p className="mb-8 font-medium">Drevo допомагає систематизувати ці дані просто і зрозуміло.</p>
                <div className="flex gap-4 justify-center md:justify-start">
                <Button href="/pages/registr" variant="primary">Розпочати</Button>
                </div>
            </div>
            <div className="flex justify-center md:justify-end">
                <Image 
                    src="/tree_illustration.svg" 
                    alt="Tree" 
                    width={450} 
                    height={450} 
                    className="w-full max-w-[350px] md:max-w-[450px] h-auto" 
                />
            </div>
            </div>
        </div>
        </section>

        <section id="details" className={styles.section_dark}>
        <div className={styles.container}>
            <div className={styles.features_about_grid}>
            <div className="opacity-40 hidden md:block">
                <Image 
                    src="/tree_silhouette.svg" 
                    alt="Silhouette" 
                    width={537} 
                    height={537} 
                    className="w-full h-auto"
                />
            </div>
            <div className={styles.features_content}>
                <div className={styles.title_group}>
                <h2 className="text-2xl uppercase tracking-widest text-[#AD9561]">Можливості Drevo</h2>
                <span className={styles.underline}></span>
                </div>
                
                <div className={styles.feature_item}>
                <h3>Створення структури родини</h3>
                <p>Легко додавайте членів родини та формуйте дерево будь-якої складності.</p>
                </div>
                <div className={styles.feature_item}>
                <h3>Збереження історій</h3>
                <p>Додавайте біографії, фото, документи та важливі події.</p>
                </div>
                <div className={styles.feature_item}>
                <h3>Контроль доступу</h3>
                <p>Визначайте, хто може переглядати або редагувати інформацію.</p>
                </div>
                <div className={styles.feature_item}>
                <h3>Безпека даних</h3>
                <p>Ваші дані захищені відповідно до сучасних стандартів.</p>
                </div>
            </div>
            </div>
        </div>
        </section>

        <section className={styles.section_light}>
        <div className={styles.container}>
            <div className={styles.center_title}>
            <h2 className="text-2xl uppercase tracking-widest">Для кого Drevo</h2>
            <span className={styles.underline}></span>
        </div>

        <div className={styles.content_wrapper}>
            <div className={styles.audience_grid_row}>
                <div className={styles.audience_card}>
                <Image src="/person.svg" alt="Icon" width={60} height={80} className="mb-4" />
                <p className="text-sm">Для тих, хто цікавиться своїм походженням</p>
                </div>
                <div className={styles.audience_card}>
                <Image src="/article.svg" alt="Icon" width={60} height={80} className="mb-4" />
                <p className="text-sm">Для сімей, які хочуть зберегти спогади</p>
                </div>
                <div className={styles.audience_card}>
                <Image src="/lock.svg" alt="Icon" width={60} height={80} className="mb-4" />
                <p className="text-sm">Для дослідників родоводу</p>
                </div>
                <div className={styles.audience_card}>
                <Image src="/cloud.svg" alt="Icon" width={60} height={80} className="mb-4" />
                <p className="text-sm">Для майбутніх поколінь</p>
            </div>
        </div>

            <div className={styles.audience_image_container}>
                <Image 
                src="/tree_silhouette1.svg" 
                alt="Family Tree" 
                width={400} 
                height={400} 
                className={styles.tree_img}
                />
            </div>
            </div>
        </div>
        </section>

        <section className={styles.section_dark}>
            <div className={styles.container}>
            <div className={styles.center_title}>
                <h2 className="text-2xl uppercase tracking-widest text-[#171717]">Як це працює</h2>
                <span className={styles.underline}></span>
            </div>

            <div className={styles.steps_grid}>
                <div className={styles.step_item}>
                    <div className={styles.step_header}>
                        <div className={styles.number_wrapper}>
                        <span className={styles.step_number}>1</span>
                        <div className={styles.number_line}></div>
                        </div>
                        <div className={styles.feature_icon}>
                        <Image src="/nature.svg" alt="Profile" width={80} height={80} />
                        </div>
                    </div>
                    <div className={styles.step_content}>
                        <h4 className="font-medium text-lg mb-2">Створіть профіль</h4>
                        <p className="text-sm opacity-70">Зареєструйтесь та створіть свій перший досвід</p>
                    </div>
                </div>

                <div className={styles.arrow_container}>
                    <div className={styles.long_arrow}></div>
                </div>

                <div className={styles.step_item}>
                    <div className={styles.step_header}>
                        <div className={styles.number_wrapper}>
                        <span className={styles.step_number}>2</span>
                        <div className={styles.number_line}></div>
                        </div>
                        <div className={styles.feature_icon}>
                        <Image src="/emoji_people.svg" alt="Add family" width={80} height={80} />
                        </div>
                    </div>
                    <div className={styles.step_content}>
                        <h4 className="font-medium text-lg mb-2">Додавайте родичів</h4>
                        <p className="text-sm opacity-70">Заповнюйте історію про членів родини та їх життєву історію</p>
                    </div>
                </div>

                <div className={styles.arrow_container}>
                    <div className={styles.long_arrow}></div>
                </div>

                <div className={styles.step_item}>
                    <div className={styles.step_header}>
                        <div className={styles.number_wrapper}>
                        <span className={styles.step_number}>3</span>
                        <div className={styles.number_line}></div>
                        </div>
                        <div className={styles.feature_icon}>
                        <Image src="/family_history.svg" alt="Build tree" width={80} height={80} />
                        </div>
                    </div>
                    <div className={styles.step_content}>
                        <h4 className="font-medium text-lg mb-2">Будуйте своє дерево</h4>
                        <p className="text-sm opacity-70">Візуалізуйте зв'язки та відкривайте історію вашого роду</p>
                    </div>
                </div>
            </div>
            </div>
        </section>

        <section className={styles.section_light}>
            <div className={styles.container}>
                <div className={styles.cta_box}>
                    <div>
                    <h2 className="text-2xl mb-2">Почніть свою історію вже сьогодні</h2>
                    <p className="opacity-60">Збережіть те, що важливо для майбутніх поколінь.</p>
                    </div>
                    <div className="mt-6 md:mt-0">
                    <Button href="/pages/registr" variant="outline">
                    Розпочати
                    </Button>
                    </div>
                </div>
            </div>
        </section>

    </main>
    );
}