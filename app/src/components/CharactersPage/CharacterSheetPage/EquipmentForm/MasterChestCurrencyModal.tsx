import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import ActionButton from "../../../ActionButton";
import type { CharacterCurrencies, CurrencyKey } from "../../../../types";
import sheetStyles from "../../../../pages/CharactersPage/CharacterSheetPage/CharacterSheetPage.module.css";
import {
  OverlayBody,
  OverlayCloseButton,
  OverlayFooter,
  OverlayHeader,
  OverlayHeaderContent,
  OverlaySummary,
  OverlayTitle,
  SheetModal
} from "../../../Overlay";
import NumberInput from "../../FormInputs/NumberInput";
import { normalizeCurrencyAmountInput } from "./equipmentLoadoutModel";
import styles from "./MasterChestModal.module.css";

export type MasterChestCurrencyDefinition = {
  code: string;
  icon: string;
  key: CurrencyKey;
  label: string;
};

type MasterChestCurrencyModalProps = {
  activeCurrencyDefinition: MasterChestCurrencyDefinition;
  activeCurrencyKey: CurrencyKey;
  canDeposit: boolean;
  canWithdraw: boolean;
  characterCurrencies: CharacterCurrencies;
  chestCurrencies: CharacterCurrencies;
  currencies: MasterChestCurrencyDefinition[];
  currencyAmountDraft: number;
  isGmMode: boolean;
  onChangeAmount: (value: number) => void;
  onChangeCurrency: (value: CurrencyKey) => void;
  onClose: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
};

function MasterChestCurrencyModal({
  activeCurrencyDefinition,
  activeCurrencyKey,
  canDeposit,
  canWithdraw,
  characterCurrencies,
  chestCurrencies,
  currencies,
  currencyAmountDraft,
  isGmMode,
  onChangeAmount,
  onChangeCurrency,
  onClose,
  onDeposit,
  onWithdraw
}: MasterChestCurrencyModalProps) {
  return (
    <SheetModal
      titleId="master-chest-currency-modal-title"
      onClose={onClose}
      size="small"
      backdropClassName={styles.currencyModalBackdrop}
      panelClassName={styles.currencyModal}
    >
      <OverlayHeader>
        <OverlayHeaderContent>
          <OverlayTitle id="master-chest-currency-modal-title">Currency balance</OverlayTitle>
          <OverlaySummary>Deposit into or withdraw from the master chest.</OverlaySummary>
        </OverlayHeaderContent>
        <OverlayCloseButton label="Close currency modal" onClick={onClose} />
      </OverlayHeader>

      <OverlayBody className={styles.currencyModalBody}>
        <div className={styles.currencySelectorRow}>
          {currencies.map((currency) => (
            <div key={currency.key} className={styles.currencySelectorCell}>
              <span className={styles.currencySelectorHint}>
                {isGmMode
                  ? "You: Unlimited"
                  : `You: ${characterCurrencies[currency.key] ?? 0} ${currency.code}`}
              </span>
              <button
                type="button"
                className={clsx(
                  styles.currencySelectorButton,
                  activeCurrencyKey === currency.key && styles.currencySelectorButtonActive
                )}
                onClick={() => onChangeCurrency(currency.key)}
              >
                <img
                  src={currency.icon}
                  alt=""
                  className={styles.currencySelectorIcon}
                  aria-hidden="true"
                />
                <strong>{chestCurrencies[currency.key] ?? 0}</strong>
                <span>{currency.code}</span>
              </button>
            </div>
          ))}
        </div>

        <div className={clsx(sheetStyles.currencyDrawerContent, styles.currencyModalActionRow)}>
          <label className={sheetStyles.currencyDrawerField}>
            <span className={sheetStyles.currencyDrawerLabel}>
              {`Amount (${activeCurrencyDefinition.label})`}
            </span>
            <NumberInput
              min={0}
              className={sheetStyles.currencyDrawerInput}
              value={currencyAmountDraft}
              onFocus={(event) => {
                if (currencyAmountDraft === 0) {
                  event.currentTarget.select();
                }
              }}
              onChange={(event) =>
                onChangeAmount(normalizeCurrencyAmountInput(event.target.value, currencyAmountDraft))
              }
            />
          </label>
        </div>
      </OverlayBody>

      <OverlayFooter>
        <div className={styles.currencyModalActions}>
          <ActionButton
            actionType="SUCCESS"
            icon={<Plus size={16} aria-hidden="true" />}
            disabled={!canDeposit}
            onClick={onDeposit}
          >
            Deposit
          </ActionButton>
          <ActionButton
            actionType="ERROR"
            icon={<Minus size={16} aria-hidden="true" />}
            disabled={!canWithdraw}
            onClick={onWithdraw}
          >
            Withdraw
          </ActionButton>
        </div>
      </OverlayFooter>
    </SheetModal>
  );
}

export default MasterChestCurrencyModal;
