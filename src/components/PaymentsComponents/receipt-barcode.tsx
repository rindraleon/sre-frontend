import {
  RECEIPT_BARCODE_CAPTION_CLASS,
  RECEIPT_BARCODE_CLASS,
  RECEIPT_BARCODE_VALUE_CLASS,
} from "@/components";

const MODELES_CODE128: readonly string[] = [
  "212222",
  "222122",
  "222221",
  "121223",
  "121322",
  "131222",
  "122213",
  "122312",
  "132212",
  "221213",
  "221312",
  "231212",
  "112232",
  "122132",
  "122231",
  "113222",
  "123122",
  "123221",
  "223211",
  "221132",
  "221231",
  "213212",
  "223112",
  "312131",
  "311222",
  "321122",
  "321221",
  "312212",
  "322112",
  "322211",
  "212123",
  "212321",
  "232121",
  "111323",
  "131123",
  "131321",
  "112313",
  "132113",
  "132311",
  "211313",
  "231113",
  "231311",
  "112133",
  "112331",
  "132131",
  "113123",
  "113321",
  "133121",
  "313121",
  "211331",
  "231131",
  "213113",
  "213311",
  "213131",
  "311123",
  "311321",
  "331121",
  "312113",
  "312311",
  "332111",
  "314111",
  "221411",
  "431111",
  "111224",
  "111422",
  "121124",
  "121421",
  "141122",
  "141221",
  "112214",
  "112412",
  "122114",
  "122411",
  "142112",
  "142211",
  "241211",
  "221114",
  "413111",
  "241112",
  "134111",
  "111242",
  "121142",
  "121241",
  "114212",
  "124112",
  "124211",
  "411212",
  "421112",
  "421211",
  "212141",
  "214121",
  "412121",
  "111143",
  "111341",
  "131141",
  "114113",
  "114311",
  "411113",
  "411311",
  "113141",
  "114131",
  "311141",
  "411131",
  "211412",
  "211214",
  "211232",
  "2331112",
];

const DEBUT_B = 104;
const ARRET = 106;
const MARGE_SILENCIEUSE = 10;

export interface BarreCode128 {
  x: number;
  largeur: number;
}

export function encoderCode128(texte: string): { barres: BarreCode128[]; totalModules: number } {
  const propre = texte.trim();
  if (!propre) return { barres: [], totalModules: 0 };
  const donnees: number[] = [];
  for (const caractere of propre) {
    const code = caractere.charCodeAt(0);
    if (code < 32 || code > 126) continue;
    donnees.push(code - 32);
  }
  if (!donnees.length) return { barres: [], totalModules: 0 };
  const controle = (DEBUT_B + donnees.reduce((somme, v, i) => somme + v * (i + 1), 0)) % 103;
  const valeurs = [DEBUT_B, ...donnees, controle, ARRET];

  const barres: BarreCode128[] = [];
  let curseur = MARGE_SILENCIEUSE;
  for (const valeur of valeurs) {
    const modele = MODELES_CODE128[valeur];
    for (let index = 0; index < modele.length; index += 1) {
      const largeur = Number(modele[index]);
      if (index % 2 === 0) {
        barres.push({ x: curseur, largeur });
      }
      curseur += largeur;
    }
  }
  return { barres, totalModules: curseur + MARGE_SILENCIEUSE };
}

export function ReceiptBarcode({
  value,
  label = "CODE-BARRES — ID DU REÇU",
}: Readonly<{
  value: string;
  label?: string;
}>) {
  const { barres, totalModules } = encoderCode128(value);
  if (!barres.length) return null;
  const hauteur = 44;
  return (
    <figure className={RECEIPT_BARCODE_CLASS} aria-label={`${label} : ${value}`}>
      <figcaption className={RECEIPT_BARCODE_CAPTION_CLASS}>{label}</figcaption>
      <svg
        viewBox={`0 0 ${totalModules} ${hauteur}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Code-barres ${value}`}
      >
        <rect x={0} y={0} width={totalModules} height={hauteur} fill="#ffffff" />
        {barres.map((barre) => (
          <rect
            key={barre.x}
            x={barre.x}
            y={0}
            width={barre.largeur}
            height={hauteur}
            fill="#0f2a42"
          />
        ))}
      </svg>
      <span className={RECEIPT_BARCODE_VALUE_CLASS}>{value}</span>
    </figure>
  );
}
