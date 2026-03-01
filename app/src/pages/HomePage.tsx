import { BookOpen, Dices, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import DragonDiceLogo from "../assets/dragon-dice.svg?react";
import styles from "./HomePage.module.css";

const cards = [
  {
    title: "Dice Roller",
    description: "Throw quick dice, enter formulas, and track a short in-session history.",
    to: "/dice",
    icon: Dices
  },
  {
    title: "Character Sheets",
    description: "Create and adjust lightweight character records without leaving the table.",
    to: "/characters",
    icon: ScrollText
  },
  {
    title: "Codex",
    description: "Search placeholder rules content for spells, weapons, armor, and core rules.",
    to: "/codex",
    icon: BookOpen
  }
];

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
        {cards.map(({ title, description, to, icon: Icon }) => (
          <Link key={title} to={to} className={styles.card}>
            <div className={styles.cardHeader}>
              <Icon size={30} />
              <span className={styles.cardAction}>Open</span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default HomePage;
