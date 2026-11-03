import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  PUBLIC_SERVICE_CARD_CLASS,
  PUBLIC_SERVICE_ICON_CLASS,
  PUBLIC_SERVICE_INDEX_CLASS,
  REVEAL_CLASS,
  REVEAL_ZOOM_CLASS,
  revealDelayClass,
} from "@/components";
import { cn } from "@/utils";

export function FeatureCard({
  index,
  Icon,
  title,
  description,
  linkText,
  delay,
}: Readonly<{
  index: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  linkText: string;
  delay?: number;
}>) {
  return (
    <article
      className={cn(
        PUBLIC_SERVICE_CARD_CLASS,
        REVEAL_CLASS,
        REVEAL_ZOOM_CLASS,
        revealDelayClass(delay),
      )}
      data-reveal="zoom"
      data-delai={delay}
    >
      <span className={PUBLIC_SERVICE_ICON_CLASS}>
        <Icon size={20} />
      </span>
      <span className={PUBLIC_SERVICE_INDEX_CLASS}>{index}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to="/connexion">
        {linkText} <ArrowRight size={14} />
      </Link>
    </article>
  );
}
