import { RotateCcw, Search } from "lucide-react";
import {
  Select,
  OptionsSelect,
  Button,
  FILTER_CHIP_CLASS,
  FILTER_BAR_ACTIONS_CLASS,
  FILTER_BAR_CLASS,
  FILTER_SUMMARY_CLASS,
} from "@/components";
import { ALL } from "@/data";
import { PAYMENT_STATUS_FILTER_OPTIONS } from "@/data";
import type { PaymentFilters, TaxType, Taxpayer } from "@/types";

export interface PaymentFilterState {
  statut: string;
  contribuableId: string;
  typeImpotId: string;
  periode: string;
  du: string;
  au: string;
  montantMin: string;
  montantMax: string;
  recherche: string;
}

export const EMPTY_PAYMENT_FILTERS: PaymentFilterState = {
  statut: ALL,
  contribuableId: "",
  typeImpotId: "",
  periode: "",
  du: "",
  au: "",
  montantMin: "",
  montantMax: "",
  recherche: "",
};

export function toPaymentFilters(
  filters: PaymentFilterState,
  page = 1,
  parPage = 25,
): PaymentFilters {
  const clean = (value: string) => value.trim() || undefined;
  return {
    statut: filters.statut === ALL ? undefined : filters.statut,
    contribuableId: clean(filters.contribuableId),
    typeImpotId: clean(filters.typeImpotId),
    periode: clean(filters.periode),
    du: clean(filters.du),
    au: clean(filters.au),
    montantMin: clean(filters.montantMin),
    montantMax: clean(filters.montantMax),
    recherche: clean(filters.recherche),
    page,
    parPage,
  };
}

export function countActiveFilters(filters: PaymentFilterState): number {
  return (
    Object.entries(filters).filter(([key, value]) => {
      if (key === "recherche" || key === "statut") return false;
      return Boolean(String(value).trim());
    }).length + (filters.statut !== ALL ? 1 : 0)
  );
}

function taxpayerLabel(taxpayer: Taxpayer): string {
  return (
    taxpayer.legalName ||
    [taxpayer.firstName, taxpayer.lastName].filter(Boolean).join(" ") ||
    taxpayer.email
  );
}

export function PaymentFilterBar({
  filters,
  onChange,
  onReset,
  onSubmit,
  taxpayers,
  taxTypes,
  isSearching = false,
  showAmounts = true,
}: Readonly<{
  filters: PaymentFilterState;
  onChange: (next: PaymentFilterState) => void;
  onReset: () => void;
  onSubmit: () => void;
  taxpayers: Taxpayer[];
  taxTypes: TaxType[];
  isSearching?: boolean;
  showAmounts?: boolean;
}>) {
  const update = (key: keyof PaymentFilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <form
      className={FILTER_BAR_CLASS}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      role="search"
      aria-label="Filtres des paiements"
    >
      <label>
        Recherche
        <input
          type="search"
          value={filters.recherche}
          placeholder="Référence, NIF, contribuable…"
          onChange={(event) => update("recherche", event.target.value)}
        />
      </label>
      <label>
        Statut
        <Select value={filters.statut} onChange={(event) => update("statut", event.target.value)}>
          <OptionsSelect options={PAYMENT_STATUS_FILTER_OPTIONS} />
        </Select>
      </label>
      <label>
        Contribuable
        <Select
          value={filters.contribuableId}
          onChange={(event) => update("contribuableId", event.target.value)}
        >
          <option value="">Tous les contribuables</option>
          {taxpayers.map((taxpayer) => (
            <option key={taxpayer.id} value={taxpayer.id}>
              {taxpayerLabel(taxpayer)}
              {taxpayer.nif ? ` · ${taxpayer.nif}` : ""}
            </option>
          ))}
        </Select>
      </label>
      <label>
        Nature d’impôt
        <Select
          value={filters.typeImpotId}
          onChange={(event) => update("typeImpotId", event.target.value)}
        >
          <option value="">Toutes les natures</option>
          {taxTypes.map((taxType) => (
            <option key={taxType.id} value={taxType.id}>
              {taxType.name}
            </option>
          ))}
        </Select>
      </label>
      <label>
        Période fiscale
        <input
          type="text"
          value={filters.periode}
          placeholder="2026-03"
          onChange={(event) => update("periode", event.target.value)}
        />
      </label>
      <label>
        Du
        <input
          type="date"
          lang="fr"
          value={filters.du}
          onChange={(event) => update("du", event.target.value)}
        />
      </label>
      <label>
        Au
        <input
          type="date"
          lang="fr"
          value={filters.au}
          onChange={(event) => update("au", event.target.value)}
        />
      </label>
      {showAmounts && (
        <>
          <label>
            Montant min. (MGA)
            <input
              type="number"
              min={0}
              step={1000}
              value={filters.montantMin}
              onChange={(event) => update("montantMin", event.target.value)}
            />
          </label>
          <label>
            Montant max. (MGA)
            <input
              type="number"
              min={0}
              step={1000}
              value={filters.montantMax}
              onChange={(event) => update("montantMax", event.target.value)}
            />
          </label>
        </>
      )}
      <div className={FILTER_BAR_ACTIONS_CLASS}>
        <Button type="submit" variant="primary" disabled={isSearching}>
          <Search size={14} /> {isSearching ? "Recherche…" : "Rechercher"}
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw size={14} /> Réinitialiser
        </Button>
      </div>
    </form>
  );
}

export function PaymentFilterSummary({
  filters,
  taxpayers,
  taxTypes,
  total,
}: Readonly<{
  filters: PaymentFilterState;
  taxpayers: Taxpayer[];
  taxTypes: TaxType[];
  total?: number;
}>) {
  const chips: string[] = [];
  if (filters.statut !== ALL) chips.push(`Statut : ${filters.statut.replaceAll("_", " ")}`);
  const taxpayer = taxpayers.find((entry) => entry.id === filters.contribuableId);
  if (taxpayer) chips.push(`Contribuable : ${taxpayerLabel(taxpayer)}`);
  const taxType = taxTypes.find((entry) => entry.id === filters.typeImpotId);
  if (taxType) chips.push(`Nature : ${taxType.name}`);
  if (filters.periode.trim()) chips.push(`Période : ${filters.periode.trim()}`);
  if (filters.du || filters.au) chips.push(`Dates : ${filters.du || "…"} → ${filters.au || "…"}`);
  if (filters.montantMin || filters.montantMax)
    chips.push(`Montant : ${filters.montantMin || "0"} → ${filters.montantMax || "∞"}`);
  if (filters.recherche.trim()) chips.push(`Recherche : « ${filters.recherche.trim()} »`);
  return (
    <div className={FILTER_SUMMARY_CLASS}>
      <span className={FILTER_CHIP_CLASS}>Filtres actifs : {chips.length}</span>
      {chips.map((chip) => (
        <span className={FILTER_CHIP_CLASS} key={chip}>
          {chip}
        </span>
      ))}
      {total != null && <span className={FILTER_CHIP_CLASS}>Résultats : {total}</span>}
    </div>
  );
}
