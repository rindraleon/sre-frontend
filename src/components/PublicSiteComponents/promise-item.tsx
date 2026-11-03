import { FileCheck2, ShieldCheck, UserRound } from "lucide-react";
import {
  PUBLIC_PROMISE_ITEM_CLASS,
  REVEAL_CLASS,
  REVEAL_UP_CLASS,
  revealDelayClass,
} from "@/components";
import { cn } from "@/utils";

const ICONS = { UserRound, FileCheck2, ShieldCheck } as const;

export function PromiseItem({
  icon,
  title,
  description,
  delay,
}: Readonly<{
  icon: keyof typeof ICONS;
  title: string;
  description: string;
  delay?: number;
}>) {
  const Icon = ICONS[icon];
  return (
    <div
      className={cn(
        PUBLIC_PROMISE_ITEM_CLASS,
        REVEAL_CLASS,
        REVEAL_UP_CLASS,
        revealDelayClass(delay),
      )}
      data-reveal
      data-delai={delay}
    >
      <span>
        <Icon size={17} />
      </span>
      <strong>{title}</strong>
      <small>{description}</small>
    </div>
  );
}
