import type { CSSProperties } from "react";
import minotaurIcon from "../../../assets/svg/minotaur.svg";

type DefaultCharacterPortraitIconProps = {
  className: string;
};

type DefaultCharacterPortraitStyle = CSSProperties & {
  "--character-portrait-default-image": string;
};

const defaultCharacterPortraitStyle: DefaultCharacterPortraitStyle = {
  "--character-portrait-default-image": `url("${minotaurIcon}")`
};

function DefaultCharacterPortraitIcon({ className }: DefaultCharacterPortraitIconProps) {
  return <span className={className} style={defaultCharacterPortraitStyle} aria-hidden="true" />;
}

export default DefaultCharacterPortraitIcon;
