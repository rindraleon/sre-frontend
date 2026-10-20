import { cn } from "@/lib/utils";

/** Marque officielle du portail SRE (logo professionnel validé). */
const MARQUE = "/logo-sre-pro.png";

export function LogoSre({
  taille = 34,
  avecTexte = true,
  sousTitre,
  className,
}: Readonly<{
  taille?: number;
  avecTexte?: boolean;
  sousTitre?: string | null;
  className?: string;
}>) {
  return (
    <>
      <span
        className={cn("logo-sre-marque", className)}
        style={{ width: taille, height: taille }}
      >
        <img src={MARQUE} alt="Logo SRE" width={taille} height={taille} />
      </span>
      {avecTexte && (
        <div>
          <strong>
            SRE<span>·</span>Fianarantsoa
          </strong>
          {sousTitre !== null && <small>{sousTitre ?? "Haute Matsiatra"}</small>}
        </div>
      )}
    </>
  );
}
