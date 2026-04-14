import clsx from "clsx";
import type { CSSProperties } from "react";
import coinCopperIcon from "../../assets/svg/coin-copper.svg";
import coinElectrumIcon from "../../assets/svg/coin-electrum.svg";
import coinGoldIcon from "../../assets/svg/coin.svg";
import coinPlatinumIcon from "../../assets/svg/coin-platinum.svg";
import coinSilverIcon from "../../assets/svg/coin-silver.svg";
import { CURRENCY_TYPE } from "../../codex/entries";
import type { CurrencyKey } from "../../types";
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

export default CurrencyInlineDisplay;
