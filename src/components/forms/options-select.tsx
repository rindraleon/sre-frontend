import type { OptionSelect } from "@/constants/options";

/** Rendu réutilisable des <option> d'un Select à partir d'une liste de constantes. */
export function OptionsSelect({ options }: Readonly<{ options: readonly OptionSelect[] }>) {
  return (
    <>
      {options.map((option) => (
        <option key={option.valeur} value={option.valeur}>
          {option.libelle}
        </option>
      ))}
    </>
  );
}
