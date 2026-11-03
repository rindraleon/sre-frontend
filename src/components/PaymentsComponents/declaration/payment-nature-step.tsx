import {
  FIELD_ERROR_CLASS,
  TAX_NOTE_CLASS,
  TAX_TYPE_CARD_CLASS,
  TAX_TYPE_EMPTY_CLASS,
  TAX_TYPE_GRID_CLASS,
  TAX_TYPE_GROUPS_CLASS,
  TAX_TYPE_GROUP_CLASS,
  TAX_TYPE_GROUP_HEAD_CLASS,
  TAX_TYPE_META_CLASS,
  TAX_TYPE_SEARCH_CLASS,
  TEXT_HELP_CLASS,
} from "@/components";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatMoney } from "@/utils";
import { PERIODICITY_LABELS, currentFiscalPeriod, type StepProps } from "./declaration-steps";

export function PaymentNatureStep({ form, taxTypes, selectedTaxType }: Readonly<StepProps>) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;
  const typeImpotId = watch("typeImpotId");
  const [search, setSearch] = useState("");
  const filteredTaxTypes = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    if (!term) return taxTypes;
    return taxTypes.filter((taxType) =>
      [taxType.name, taxType.description, taxType.code]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase("fr").includes(term)),
    );
  }, [search, taxTypes]);
  const groupedTaxTypes = useMemo(
    () =>
      Object.entries(PERIODICITY_LABELS)
        .map(([periodicity, label]) => ({
          periodicity,
          label,
          taxTypes: filteredTaxTypes.filter((taxType) => taxType.periodicity === periodicity),
        }))
        .filter((group) => group.taxTypes.length > 0),
    [filteredTaxTypes],
  );

  return (
    <>
      <p className={TEXT_HELP_CLASS}>
        Seules les natures publiées par l’administration et applicables à votre profil sont
        proposées.
      </p>
      <label className={TAX_TYPE_SEARCH_CLASS}>
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher une nature d’impôt"
          aria-label="Rechercher une nature d’impôt"
        />
      </label>
      <div className={TAX_TYPE_GROUPS_CLASS} role="group" aria-label="Natures d’impôt disponibles">
        {groupedTaxTypes.map((group) => (
          <section className={TAX_TYPE_GROUP_CLASS} key={group.periodicity}>
            <div className={TAX_TYPE_GROUP_HEAD_CLASS}>
              <h3>{group.label}</h3>
              <span>
                {group.taxTypes.length} nature{group.taxTypes.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className={TAX_TYPE_GRID_CLASS}>
              {group.taxTypes.map((taxType) => (
                <button
                  key={taxType.id}
                  type="button"
                  aria-pressed={typeImpotId === taxType.id}
                  className={TAX_TYPE_CARD_CLASS}
                  onClick={() => {
                    setValue("typeImpotId", taxType.id, { shouldValidate: true });
                    setValue(
                      "periode",
                      taxType.periodicity === "PONCTUELLE"
                        ? ""
                        : currentFiscalPeriod(taxType.periodicity),
                      { shouldValidate: true },
                    );
                  }}
                >
                  <strong>{taxType.name}</strong>
                  {taxType.description && <small>{taxType.description}</small>}
                  <span className={TAX_TYPE_META_CLASS}>
                    <span>{group.label}</span>
                    {taxType.referenceAmount != null && (
                      <span>Réf. {formatMoney(taxType.referenceAmount)}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
        {groupedTaxTypes.length === 0 && (
          <p className={TAX_TYPE_EMPTY_CLASS}>
            Aucune nature d’impôt ne correspond à cette recherche.
          </p>
        )}
      </div>
      {errors.typeImpotId && (
        <p className={FIELD_ERROR_CLASS} role="alert">
          {errors.typeImpotId.message}
        </p>
      )}
      {selectedTaxType?.amountMode === "FIXE" && selectedTaxType.referenceAmount != null && (
        <div className={TAX_NOTE_CLASS}>
          <span>i</span>
          <p>
            Montant de référence pour cet impôt :{" "}
            <strong>{formatMoney(selectedTaxType.referenceAmount)}</strong>. Vous pouvez l’ajuster
            si votre situation le justifie.
          </p>
        </div>
      )}
    </>
  );
}
