import clsx from "clsx";
import type { ButtonHTMLAttributes, CSSProperties } from "react";
import coinCopperIcon from "../../assets/svg/coin-copper.svg";
import coinElectrumIcon from "../../assets/svg/coin-electrum.svg";
import coinGoldIcon from "../../assets/svg/coin.svg";
import coinPlatinumIcon from "../../assets/svg/coin-platinum.svg";
import coinSilverIcon from "../../assets/svg/coin-silver.svg";
import { CURRENCY_TYPE } from "../../codex/entries";
import type { CharacterCurrencies, CurrencyKey } from "../../types";
import styles from "./CurrencyInlineDisplay.module.css";

type CurrencyInlineDisplayProps = {
  cost: {
    amount: number;
    currency: CURRENCY_TYPE;
  };
  className?: string;
  iconClassName?: string;
  style?: CSSProperties;
  iconStyle?: CSSProperties;
};

type CurrencyDefinition = {
  key: CurrencyKey;
  code: string;
  icon: string;
};

const currencyDefinitions: Record<CurrencyKey, CurrencyDefinition> = {
  copper: { key: "copper", code: "CP", icon: coinCopperIcon },
  silver: { key: "silver", code: "SP", icon: coinSilverIcon },
  electrum: { key: "electrum", code: "EP", icon: coinElectrumIcon },
  gold: { key: "gold", code: "GP", icon: coinGoldIcon },
  platinum: { key: "platinum", code: "PP", icon: coinPlatinumIcon }
};

const currencyKeyByType: Record<CURRENCY_TYPE, CurrencyKey> = {
  [CURRENCY_TYPE.CP]: "copper",
  [CURRENCY_TYPE.SP]: "silver",
  [CURRENCY_TYPE.EP]: "electrum",
  [CURRENCY_TYPE.GP]: "gold",
  [CURRENCY_TYPE.PP]: "platinum"
};

function formatCurrencyBalanceAmount(amount: number): string {
  const normalizedAmount = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));

  if (normalizedAmount < 1000) {
    return `${normalizedAmount}`;
  }

  const compactAmount = Math.floor(normalizedAmount / 100) / 10;
  return `${compactAmount.toFixed(1)}K`;
}

function CurrencyInlineDisplay({
  cost,
  className,
  iconClassName,
  style,
  iconStyle
}: CurrencyInlineDisplayProps) {
  const currencyDefinition = currencyDefinitions[currencyKeyByType[cost.currency]];

  return (
    <span className={clsx(styles.root, className)} style={style}>
      <img
        src={currencyDefinition.icon}
        alt=""
        className={clsx(styles.icon, iconClassName)}
        style={iconStyle}
        aria-hidden="true"
      />
      <span>{cost.amount}</span>
      <span>{currencyDefinition.code}</span>
    </span>
  );
}

type CurrencyBalancePillProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  currencies: Partial<CharacterCurrencies>;
};

export function CurrencyBalancePill({
  currencies,
  className,
  type = "button",
  ...props
}: CurrencyBalancePillProps) {
  return (
    <button type={type} className={clsx(styles.balancePill, className)} {...props}>
      <span className={styles.balanceSummary}>
        {Object.values(currencyDefinitions).map((currencyDefinition) => (
          <span key={currencyDefinition.key} className={styles.balanceToken}>
            <img
              src={currencyDefinition.icon}
              alt=""
              className={styles.balanceTokenIcon}
              aria-hidden="true"
            />
            <span className={styles.balanceTokenValue}>
              {formatCurrencyBalanceAmount(currencies[currencyDefinition.key] ?? 0)}
            </span>
            <span className={styles.balanceTokenCode}>{currencyDefinition.code}</span>
          </span>
        ))}
      </span>
    </button>
  );
}

export default CurrencyInlineDisplay;
