import DragonDiceLogo from "../../assets/dragon-dice.svg?react";
import FeatureCard from "./FeatureCard";
import { homeCards } from "./homePage.data";
import styles from "./HomePage.module.css";

function HomePage() {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Session dashboard</p>
          <h2 className={styles.title}>Keep the essentials one tap away.</h2>
          <p className={styles.description}>
            This starter PWA keeps rolling, character notes, and quick rules lookup available
            even when the connection drops.
          </p>
        </div>
        <div className={styles.logoWrap}>
          <DragonDiceLogo className={styles.logo} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.cardGrid}>
        {homeCards.map((card) => (
          <FeatureCard key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}

export default HomePage;
