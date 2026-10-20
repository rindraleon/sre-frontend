import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export function FeatureCard({
  index,
  Icône,
  titre,
  description,
  lienTexte,
  delai,
}: Readonly<{
  index: string;
  Icône: LucideIcon;
  titre: string;
  description: string;
  lienTexte: string;
  /** Index de cascade pour l'animation « reveal » (optionnel). */
  delai?: number;
}>) {
  return (
    <article data-revelation="zoom" data-delai={delai}>
      <span className="service-icone-sre service-icone-sre--bleu">
        <Icône size={20} />
      </span>
      <span className="service-index-sre">{index}</span>
      <h3>{titre}</h3>
      <p>{description}</p>
      <Link to="/connexion">
        {lienTexte} <ArrowRight size={14} />
      </Link>
    </article>
  );
}
