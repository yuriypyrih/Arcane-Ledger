import { Link } from "react-router-dom";
import type { HomeCard } from "../../../pages/HomePage/homePage.data";
import styles from "./HomeFeatureCard.module.css";

type HomeFeatureCardProps = {
  card: HomeCard;
};

function HomeFeatureCard({ card }: HomeFeatureCardProps) {
  const { title, description, to, icon: Icon } = card;

  return (
    <Link to={to} className={styles.card}>
      <div className={styles.cardHeader}>
        <Icon size={30} />
        <span className={styles.cardAction}>Open</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
}

export default HomeFeatureCard;
