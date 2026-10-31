const UNITES = [
  "zéro",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
];

const DIZAINES: Record<number, string> = {
  20: "vingt",
  30: "trente",
  40: "quarante",
  50: "cinquante",
  60: "soixante",
  80: "quatre-vingt",
};

const MOIS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function centaineEnLettres(nombre: number, accord = true): string {
  if (nombre < 17) return UNITES[nombre];
  if (nombre < 20) return `dix-${UNITES[nombre - 10]}`;
  if (nombre < 70) {
    const dizaine = Math.floor(nombre / 10) * 10;
    const unite = nombre % 10;
    if (unite === 0) return DIZAINES[dizaine];
    if (unite === 1) return `${DIZAINES[dizaine]}-et-un`;
    return `${DIZAINES[dizaine]}-${UNITES[unite]}`;
  }
  if (nombre < 80) {
    const reste = nombre - 60;
    return reste === 11 ? "soixante-et-onze" : `soixante-${centaineEnLettres(reste, false)}`;
  }
  if (nombre < 100) {
    const reste = nombre - 80;
    if (reste === 0) return accord ? "quatre-vingts" : "quatre-vingt";
    return `quatre-vingt-${centaineEnLettres(reste, false)}`;
  }
  const centaines = Math.floor(nombre / 100);
  const reste = nombre % 100;
  if (centaines === 1) {
    return reste === 0 ? "cent" : `cent ${centaineEnLettres(reste, false)}`;
  }
  const prefixe = `${UNITES[centaines]} cent`;
  if (reste === 0) return accord ? `${prefixe}s` : prefixe;
  return `${prefixe} ${centaineEnLettres(reste, false)}`;
}

export function nombreEnLettres(valeur: number): string {
  const nombre = Math.floor(Math.abs(valeur));
  if (nombre === 0) return "zéro";
  if (nombre >= 1_000_000_000_000) return nombre.toLocaleString("fr-FR");

  const tranches: Array<[number, string, string]> = [
    [1_000_000_000, "milliard", "milliards"],
    [1_000_000, "million", "millions"],
    [1_000, "mille", "mille"],
  ];

  let reste = nombre;
  const morceaux: string[] = [];
  for (const [poids, singulier, pluriel] of tranches) {
    const quantite = Math.floor(reste / poids);
    if (quantite === 0) continue;
    reste %= poids;
    const quantiteEnLettres = centaineEnLettres(quantite, false);
    if (poids === 1_000) {
      morceaux.push(quantite === 1 ? singulier : `${quantiteEnLettres} ${singulier}`);
    } else {
      morceaux.push(`${quantiteEnLettres} ${quantite > 1 ? pluriel : singulier}`);
    }
  }
  if (reste > 0) morceaux.push(centaineEnLettres(reste));
  return morceaux.join(" ");
}

export function montantEnLettres(montant: number, devise = "MGA"): string {
  const unites: Record<string, string> = {
    MGA: "ariary",
    EUR: "euros",
    USD: "dollars",
  };
  const phrase = `${nombreEnLettres(Math.round(montant))} ${unites[devise] ?? devise.toLowerCase()}`;
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

/** Traduit une période fiscale en libellé lisible, sans ajouter le terme « exercice ». */
export function formatFiscalPeriod(periode: string | null | undefined): string {
  const valeur = (periode ?? "").trim();
  if (!valeur || valeur === "—") return "Non applicable";
  const moisMatch = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(valeur);
  if (moisMatch) {
    const annee = moisMatch[1];
    const mois = MOIS_FR[Number(moisMatch[2]) - 1];
    return `${mois} ${annee}`;
  }
  const trimestreMatch = /^(\d{4})-T([1-4])$/i.exec(valeur);
  if (trimestreMatch) {
    return `${trimestreMatch[2]}e trimestre ${trimestreMatch[1]}`;
  }
  if (/^\d{4}$/.test(valeur)) {
    return valeur;
  }
  const jourMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valeur);
  if (jourMatch) {
    return `${jourMatch[3]}/${jourMatch[2]}/${jourMatch[1]}`;
  }
  return valeur;
}

export function formatReceiptDateTime(date: string | null | undefined): string {
  if (!date) return "—";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Indian/Antananarivo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(value);
  const read = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${read("day")}/${read("month")}/${read("year")}  •  ${read("hour")}:${read("minute")}:${read("second")}`;
}

export function formatPaymentModeLabel(
  mode?: string | null,
  operator?: string | null,
  bankOrChannel?: string | null,
): string {
  const operators: Record<string, string> = {
    MVOLA: "MVola",
    ORANGE_MONEY: "Orange Money",
    AIRTEL_MONEY: "Airtel Money",
  };
  if (mode === "VIREMENT_BANCAIRE") {
    return bankOrChannel?.trim()
      ? `Virement bancaire (${bankOrChannel.trim()})`
      : "Virement bancaire";
  }
  if (mode === "MOBILE_MONEY") {
    const op = operator ? (operators[operator] ?? operator.replaceAll("_", " ")) : "";
    return op ? `Mobile Money (${op})` : "Mobile Money";
  }
  return mode ? mode.replaceAll("_", " ") : "—";
}
