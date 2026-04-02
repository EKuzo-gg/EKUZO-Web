import Image from "next/image";

const ICONS = [
  // Black icons
  "swords",
  "clock",
  "trophy",
  "book",
  "flame",
  "flash",
  "confidence",
  "heart",
  "leadership",
  "skills",
  "chat",
  "handshake",
  "handwave",
  "speaking",
  "confidence-2",
  "strategy",
  "key",
  "roles",
  "hard-problem",
  "run-first",
  "easy",
  "youth",
  "calendar",
  "enthusiasm",
  "team",
  "visualize",
  "key-2",
  "swords-2",
  "camada",
  "loot",
  // White icons
  "swords-white",
  "clock-white",
  "camada-white",
  "trophy-white",
] as const;

export type IconName = (typeof ICONS)[number];

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  alt?: string;
};

export default function Icon({ name, size = 40, className = "", alt = "" }: IconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={alt}
      width={size}
      height={size}
      className={className}
    />
  );
}
