import { FileCheck2, ShieldCheck, UserRound } from "lucide-react";

const ICONES = { UserRound, FileCheck2, ShieldCheck } as const;

export function PromiseItem({
  icone,
  titre,
  description,
  delai,
}: Readonly<{
  icone: keyof typeof ICONES;
  titre: string;
  description: string;
  delai?: number;
}>) {
  const Icône = ICONES[icone];
  return (
    <div data-revelation data-delai={delai}>
      <span>
        <Icône size={17} />
      </span>
      <strong>{titre}</strong>
      <small>{description}</small>
    </div>
  );
}
