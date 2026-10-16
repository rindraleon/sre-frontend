import { FileCheck2, ShieldCheck, WalletCards } from "lucide-react";

export const FEATURES = [
  {
    index: "01 · CONSULTER",
    icone: FileCheck2,
    titre: "Obligations",
    description:
      "Consultez les obligations créées par l’administration et associées à votre profil.",
    lienTexte: "Se connecter",
  },
  {
    index: "02 · DÉCLARER",
    icone: WalletCards,
    titre: "Déclaration d’opération",
    description:
      "Soumettez les informations d’une opération déjà effectuée afin qu’elle soit examinée.",
    lienTexte: "Accéder au suivi",
  },
  {
    index: "03 · SUIVRE",
    icone: ShieldCheck,
    titre: "Décisions et documents",
    description: "Consultez les décisions et les documents effectivement émis par le serveur.",
    lienTexte: "Ouvrir mon espace",
  },
];

export const ETAPES = [
  {
    numero: "01",
    titre: "Créez votre accès",
    description: "Votre compte est géré et vérifié par le serveur.",
  },
  {
    numero: "02",
    titre: "Consultez votre dossier",
    description: "Les obligations et coordonnées proviennent des données enregistrées.",
  },
  {
    numero: "03",
    titre: "Déclarez une opération",
    description: "Une référence fournie ne prouve ni le transfert ni le règlement.",
  },
  {
    numero: "04",
    titre: "Suivez l’examen",
    description:
      "Une décision explicite de l’administration met à jour le statut de la déclaration.",
  },
];

export const PROMESSES = [
  {
    icone: "UserRound",
    titre: "Un espace par compte",
    description: "Les données sont limitées à la session authentifiée.",
  },
  {
    icone: "FileCheck2",
    titre: "Informations consultables",
    description: "Obligations et déclarations renvoyées par le serveur.",
  },
  {
    icone: "ShieldCheck",
    titre: "Accès encadré",
    description: "Les autorisations sont contrôlées par l’API.",
  },
] as const;
