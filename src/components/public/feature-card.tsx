import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

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
  /** Cascade index for the "reveal" animation (optional). */
  delay?: number;
}>) {
  return (
    <article data-reveal="zoom" data-delai={delay}>
      <span className="service-icon-sre service-icon-sre--blue">
        <Icon size={20} />
      </span>
      <span className="service-index-sre">{index}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link to="/connexion">
        {linkText} <ArrowRight size={14} />
      </Link>
    </article>
  );
}
