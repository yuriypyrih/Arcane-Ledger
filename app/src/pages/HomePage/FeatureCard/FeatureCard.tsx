import { Link } from "react-router-dom";
import type { HomeCard } from "../homePage.data";
import styles from "./FeatureCard.module.css";

type FeatureCardProps = {
  card: HomeCard;
};

function FeatureCard({ card }: FeatureCardProps) {
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

export default FeatureCard;
