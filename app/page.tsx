import Image from "next/image";
import styles from "./style.module.css";
import Button from "./component/button/button";

export default function Home() {
  return (
    <main className={styles.main}>
      
      {/* SECTION 1: HERO */}
      <section className={styles.section_light}>
        <div className={styles.container}>
          <div className={styles.hero_grid}>
            <div className={styles.hero_content}>
              <h1>Project Drevo<br/>Генеалогічне дерево</h1>
              <span className={styles.underline} style={{margin: '0'}}></span>
              <p className={styles.hero_description}>
                Відкрийте свою історію. Збережіть спадок для майбутніх поколінь.<br/><br/>
                Drevo - це зручний сервіс для створення та збереження вашого родоводу онлайн.
              </p>
              <div className={styles.hero_buttons}>
                <Button href="/pages/registr" variant="primary">Розпочати</Button>
                <Button href="/pages/about" variant="outline">
                  Дізнатися більше
                </Button>
              </div>
            </div>
            <div className={styles.hero_image}>
              <Image src="/tree_illustration.svg" alt="Family Tree" width={500} height={500} priority />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: POSSIBILITIES */}
      <section className={styles.section_dark}>
        <div className={styles.container}>
          <div className={styles.title_group}>
            <h2 className="text-2xl uppercase tracking-widest">Можливості Drevo</h2>
            <span className={styles.underline}></span>
          </div>
          
          <div className={styles.features_grid}>
            {[
              { 
                title: "Створюйте дерево", 
                desc: "Додайте членів родини та будуйте своє сімейне дерево легко та зручно",
                icon: "/person.svg" // Путь к иконке
              },
              { 
                title: "Зберігайте історію", 
                desc: "Зберігайте важливі події у життєвих історіях ваших предків",
                icon: "/article.svg"
              },
              { 
                title: "Налаштовуйте доступ", 
                desc: "Налаштуйте приватність та діліться деревом",
                icon: "/lock.svg"
              },
              { 
                title: "Ваші дані в безпеці", 
                desc: "Ми дбаємо про безпеку ваших даних та їх захист",
                icon: "/cloud.svg"
              },
            ].map((f, i) => (
              <div key={i} className={styles.feature_card}>
                <div className={styles.feature_icon}>
                  <Image 
                    src={f.icon} 
                    alt={f.title} 
                    width={80} 
                    height={80} 
                    className="opacity-90"
                  />
                </div>
                <h3 className="text-[#AD9561] mb-2 uppercase text-sm">{f.title}</h3>
                <p className="text-xs opacity-80">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className={styles.section_light}>
        <div className={styles.container}>
          <div className={styles.title_group}>
            <h2 className="text-2xl uppercase tracking-widest text-[#171717]">Як це працює</h2>
            <span className={styles.underline}></span>
          </div>

          <div className={styles.steps_grid}>
            {/* Шаг 1 */}
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

            {/* Шаг 2 */}
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

            {/* Шаг 3 */}
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

      <section className={styles.section_dark}>
        <div className={styles.container}>
          <div className={styles.cta_box}>
            <div>
              <h2 className="text-2xl">Почніть свою історію вже сьогодні</h2>
              <p className="opacity-60">Збережіть те, що важливо для майбутніх поколінь.</p>
            </div>
            <Button href="/pages/registr" variant="outline">
              Розпочати
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
}