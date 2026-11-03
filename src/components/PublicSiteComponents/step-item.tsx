import {
  PUBLIC_STEP_ITEM_CLASS,
  REVEAL_CLASS,
  REVEAL_RIGHT_CLASS,
  revealDelayClass,
} from "@/components";
import { cn } from "@/utils";

export function StepItem({
  number,
  title,
  description,
  delay,
}: Readonly<{
  number: string;
  title: string;
  description: string;
  delay?: number;
}>) {
  return (
    <article
      className={cn(
        PUBLIC_STEP_ITEM_CLASS,
        REVEAL_CLASS,
        REVEAL_RIGHT_CLASS,
        revealDelayClass(delay),
      )}
      data-reveal="droite"
      data-delai={delay}
    >
      <span>{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
