import type { CSSProperties } from "react";
import UserIcon from "../../../assets/svg/theater-mask.svg";

type DefaultCharacterPortraitIconProps = {
  className: string;
};

type DefaultCharacterPortraitStyle = CSSProperties & {
  "--character-portrait-default-image": string;
};

const defaultCharacterPortraitStyle: DefaultCharacterPortraitStyle = {
  "--character-portrait-default-image": `url("${UserIcon}")`
};

function DefaultCharacterPortraitIcon({ className }: DefaultCharacterPortraitIconProps) {
  return <span className={className} style={defaultCharacterPortraitStyle} aria-hidden="true" />;
}

export default DefaultCharacterPortraitIcon;
