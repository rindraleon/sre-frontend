import { Select } from "@/components/ui/select";
import { useMemo, useState, type ChangeEvent } from "react";
import readXlsxFile, { type CellValue, type Sheet } from "read-excel-file/browser";
import {
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileSpreadsheet,
  MailCheck,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import type { ImportHistoryEntry, ImportErrorRow, TaxpayerType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxpayer, type ApiTaxpayer } from "@/services/api-client";
import { SRE_REGION } from "@/utils/constants";
import { StatusBadge, Button, CoreSpinLoader, PageHeader } from "@/components/ui";
import { formatDate } from "@/utils/format";
import {
  type AnalyseLigne,
  type MappingField,
  type Mappings,
  type ImportProfile,
  MAPPING_FIELDS,
  cleNormalisee,
  mappingVide,
  texteCellule,
} from "./taxpayer-import.utils";
export function AdminTaxpayerImportPage() {
  const { mettreAJourEtat, notifier } = useSre();
  const { session } = useAuth();
  const [feuilles, setFeuilles] = useState<Sheet[]>([]);
  const [nomFeuille, setNomFeuille] = useState("");
  const [fichierNom, setFichierNom] = useState("");
  const [enTetes, setEnTetes] = useState<string[]>([]);
  const [lignesExcel, setLignesExcel] = useState<(CellValue | null)[][]>([]);
  const [mapping, setMapping] = useState<Mappings>(mappingVide);
  const [analyse, setAnalyse] = useState<AnalyseLigne[] | null>(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const [rapport, setRapport] = useState<ImportHistoryEntry | null>(null);
  const [emailsImport, setEmailsImport] = useState<
    {
      compteId: string;
      destinataire: string;
      statutCourriel: string;
      demandeId: string | null;
    }[]
  >([]);
  const [renvoiEnCours, setRenvoiEnCours] = useState<string | null>(null);
  const [filtreLignes, setFiltreLignes] = useState("TOUS");
  const feuilleActive = feuilles.find((feuille) => feuille.sheet === nomFeuille);
  const colonnesValides = useMemo(
    () =>
      MAPPING_FIELDS.filter((champ) => champ.obligatoire).every(
        (champ) => mapping[champ.champ] !== "",
      ),
    [mapping],
  );
  const lignesAnalysees = useMemo(
    () =>
      (analyse ?? []).filter(
        (ligne) => {
          if (filtreLignes === "TOUS") return true;
          if (filtreLignes === "VALIDES") return Boolean(ligne.profil);
          if (filtreLignes === "DOUBLONS") return ligne.doublon;
          return ligne.erreurs.length > 0;
        },
      ),
    [analyse, filtreLignes],
  );

  const initialiserFeuille = (feuille: Sheet) => {
    const lignes = feuille.data ?? [];
    const enTetesFeuille = (lignes[0] ?? []).map(
      (cellule, index) => texteCellule(cellule) || `Colonne ${index + 1}`,
    );
    const correspondances = { ...mappingVide };
    for (const entree of MAPPING_FIELDS) {
      const index = enTetesFeuille.findIndex((entete) =>
        entree.aliases.map(cleNormalisee).includes(cleNormalisee(entete)),
      );
      if (index >= 0) correspondances[entree.champ] = String(index);
    }
    setNomFeuille(feuille.sheet);
    setEnTetes(enTetesFeuille);
    setLignesExcel(lignes.slice(1));
    setMapping(correspondances);
    setAnalyse(null);
    setRapport(null);
    setFiltreLignes("TOUS");
  };

  const lireFichier = async (event: ChangeEvent<HTMLInputElement>) => {
    const fichier = event.target.files?.[0];
    if (!fichier) return;
    setErreur("");
    setRapport(null);
    setFichierNom(fichier.name);
    if (!fichier.name.toLowerCase().endsWith(".xlsx")) {
      setErreur("Choisissez un fichier Excel .xlsx.");
      event.target.value = "";
      return;
    }
    if (fichier.size > 10 * 1024 * 1024) {
      setErreur("Le fichier dépasse la limite de 10 Mo.");
      event.target.value = "";
      return;
    }
    setChargement(true);
    try {
      const resultat = await readXlsxFile(fichier);
      const feuillesNonVides = resultat.filter((feuille) => feuille.data?.length);
      if (!feuillesNonVides.length) {
        setErreur("Aucune feuille ou ligne lisible n’a été trouvée.");
        setFeuilles([]);
        return;
      }
      if (feuillesNonVides.some((feuille) => feuille.data.length > 2001)) {
        setErreur("La limite est de 2 000 lignes de données par feuille.");
        setFeuilles([]);
        return;
      }
      setFeuilles(feuillesNonVides);
      initialiserFeuille(feuillesNonVides[0]);
    } catch {
      setErreur(
        "Impossible de lire ce classeur. Vérifiez qu’il s’agit d’un fichier .xlsx valide, puis réessayez.",
      );
      setFeuilles([]);
    } finally {
      setChargement(false);
    }
  };

  const choisirFeuille = (nom: string) => {
    const feuille = feuilles.find((entree) => entree.sheet === nom);
    if (feuille) initialiserFeuille(feuille);
  };
  const changerMapping = (champ: MappingField, valeur: string) => {
    setMapping((courant) => ({ ...courant, [champ]: valeur }));
    setAnalyse(null);
    setRapport(null);
  };
  const valeurMappee = (ligne: (CellValue | null)[], champ: MappingField) => {
    const index = mapping[champ] === "" ? -1 : Number(mapping[champ]);
    return index < 0 ? "" : texteCellule(ligne[index]);
  };

  const analyserType = (ligne: number, typeBrut: string, erreurs: ImportErrorRow[]): TaxpayerType => {
    const typeNormalise = cleNormalisee(typeBrut);
    if (
      typeNormalise.includes("entreprise") ||
      typeNormalise.includes("societe") ||
      typeNormalise.includes("professionnel")
    ) return "ENTREPRISE";
    if (typeNormalise.includes("particulier") || typeNormalise.includes("personne"))
      return "PARTICULIER";
    erreurs.push({
      ligne,
      champ: "Type",
      message: "Indiquez explicitement Particulier ou Entreprise.",
    });
    return "PARTICULIER";
  };

  const verifierDoublons = (
    numero: number,
    courriel: string,
    nif: string,
    stat: string,
    ensembles: { emails: Set<string>; nifs: Set<string>; stats: Set<string> },
    erreurs: ImportErrorRow[],
  ) => {
    let doublon = false;
    if (courriel && ensembles.emails.has(courriel)) {
      doublon = true;
      erreurs.push({ ligne: numero, champ: "E-mail", message: "Cette adresse apparaît plusieurs fois dans le classeur." });
    }
    if (nif && ensembles.nifs.has(nif)) {
      doublon = true;
      erreurs.push({ ligne: numero, champ: "NIF", message: "Ce NIF apparaît plusieurs fois dans le classeur." });
    }
    if (stat && ensembles.stats.has(stat)) {
      doublon = true;
      erreurs.push({ ligne: numero, champ: "STAT", message: "Ce STAT apparaît plusieurs fois dans le classeur." });
    }
    if (courriel) ensembles.emails.add(courriel);
    if (nif) ensembles.nifs.add(nif);
    if (stat) ensembles.stats.add(stat);
    return doublon;
  };

  const verifierChampsObligatoires = ({
    numero,
    type,
    raisonSociale,
    nom,
    courriel,
    telephone,
    adresse,
    region,
    ville,
    erreurs,
  }: {
    numero: number;
    type: TaxpayerType;
    raisonSociale: string;
    nom: string;
    courriel: string;
    telephone: string;
    adresse: string;
    region: string;
    ville: string;
    erreurs: ImportErrorRow[];
  }) => {
    if (type === "ENTREPRISE" && !(raisonSociale || nom))
      erreurs.push({ ligne: numero, champ: "Raison sociale", message: "La raison sociale est requise." });
    if (type === "PARTICULIER" && !nom)
      erreurs.push({ ligne: numero, champ: "Nom", message: "Le nom du contribuable est requis." });
    const indexArobase = courriel.indexOf("@");
    const domaine = courriel.slice(indexArobase + 1);
    const indexPoint = domaine.indexOf(".");
    if (
      !courriel ||
      indexArobase <= 0 ||
      indexArobase !== courriel.lastIndexOf("@") ||
      /\s/.test(courriel) ||
      indexPoint <= 0 ||
      indexPoint === domaine.length - 1
    )
      erreurs.push({ ligne: numero, champ: "E-mail", message: "Une adresse e-mail valide est requise." });
    if (telephone.length < 7)
      erreurs.push({ ligne: numero, champ: "Téléphone", message: "Un numéro de téléphone valide est requis." });
    if (adresse.length < 3)
      erreurs.push({ ligne: numero, champ: "Adresse", message: "Une adresse est requise." });
    if (cleNormalisee(region) !== cleNormalisee(SRE_REGION))
      erreurs.push({ ligne: numero, champ: "Région", message: `Le service est limité à ${SRE_REGION}.` });
    if (!ville)
      erreurs.push({ ligne: numero, champ: "Ville / Commune", message: "La ville ou commune est requise." });
  };

  const analyserLigne = (
    ligne: (CellValue | null)[],
    index: number,
    emails: Set<string>,
    nifs: Set<string>,
    stats: Set<string>,
  ): AnalyseLigne => {
    const numero = index + 2;
    const valeurs = ligne.map(texteCellule);
    const erreurs: ImportErrorRow[] = [];
    if (valeurs.every((valeur) => !valeur)) return { numero, valeurs, erreurs, doublon: false };
    const type = analyserType(numero, valeurMappee(ligne, "type"), erreurs);
    const raisonSociale = valeurMappee(ligne, "raisonSociale");
    const nom = valeurMappee(ligne, "nom");
    const prenom = valeurMappee(ligne, "prenom");
    const nif = valeurMappee(ligne, "nif").trim().toUpperCase();
    const stat = valeurMappee(ligne, "stat").trim().toUpperCase();
    const courriel = valeurMappee(ligne, "courriel").trim().toLowerCase();
    const telephone = valeurMappee(ligne, "telephone").trim();
    const adresse = valeurMappee(ligne, "adresse").trim();
    const region = valeurMappee(ligne, "region").trim();
    const ville = valeurMappee(ligne, "ville").trim();
    verifierChampsObligatoires({
      numero,
      type,
      raisonSociale,
      nom,
      courriel,
      telephone,
      adresse,
      region,
      ville,
      erreurs,
    });
    const doublon = verifierDoublons(numero, courriel, nif, stat, { emails, nifs, stats }, erreurs);
    const nomCommercial = valeurMappee(ligne, "nomCommercial").trim();
    const representantLegal = valeurMappee(ligne, "representantLegal").trim();
    const profil: ImportProfile | undefined = erreurs.length
      ? undefined
      : {
          type,
          nom: (nom || raisonSociale).trim(),
          ...(prenom.trim() ? { prenom: prenom.trim() } : {}),
          ...(raisonSociale.trim() ? { raisonSociale: raisonSociale.trim() } : {}),
          ...(nomCommercial ? { nomCommercial } : {}),
          ...(nif ? { nif } : {}),
          ...(stat ? { stat } : {}),
          adresse,
          region: SRE_REGION,
          ville,
          courriel,
          telephone,
          ...(representantLegal ? { representantLegal } : {}),
        };
    return { numero, valeurs, profil, erreurs, doublon };
  };

  const analyser = () => {
    setErreur("");
    setRapport(null);
    if (!enTetes.length || !lignesExcel.length) {
      setErreur("Le classeur ne contient aucune ligne de données à analyser.");
      return;
    }
    if (!colonnesValides) {
      setErreur(
        "Mappez le type de contribuable, l’e-mail, le téléphone, l’adresse, la région et la ville/commune.",
      );
      return;
    }
    const emails = new Set<string>();
    const nifs = new Set<string>();
    const stats = new Set<string>();
    const resultats = lignesExcel
      .map((ligne, index) => analyserLigne(ligne, index, emails, nifs, stats))
      .filter((ligne) => ligne.valeurs.some(Boolean));
    setAnalyse(resultats);
    setFiltreLignes("TOUS");
    if (!resultats.length) setErreur("Aucune ligne de données sous l’en-tête.");
  };

  const lancerImport = async () => {
    if (!analyse) return;
    if (!session?.jetonApi) {
      setErreur("Session serveur introuvable. Reconnectez-vous.");
      return;
    }
    const profils = analyse.flatMap((ligne) =>
      ligne.profil && !ligne.doublon && !ligne.erreurs.length ? [ligne.profil] : [],
    );
    if (!profils.length) {
      setErreur("Aucune ligne valide à importer.");
      return;
    }
    setErreur("");
    setChargement(true);
    try {
      const resultat = await callApi<{
        donnees: ApiTaxpayer[];
        creees: number;
        ignorees: number;
        comptesCrees: number;
        doublons: number;
        rejetees: number;
        emails: {
          compteId: string;
          destinataire: string;
          statutCourriel: string;
          demandeId: string | null;
        }[];
      }>("contribuables/import", { method: "POST", token: session.jetonApi, body: { profils } });
      const profilsCrees = resultat.donnees.map((entree) => mapApiTaxpayer(entree));
      mettreAJourEtat((courant) => ({
        ...courant,
        contribuables: [...profilsCrees, ...courant.contribuables],
      }));
      setEmailsImport(resultat.emails ?? []);
      const lignesLocalesIgnorees = analyse.filter(
        (ligne) => !ligne.profil || ligne.doublon || ligne.erreurs.length,
      ).length;
      const erreurs = analyse.flatMap((ligne) => ligne.erreurs);
      if (resultat.rejetees)
        erreurs.push({
          ligne: 0,
          message: `${resultat.rejetees} ligne(s) rejetée(s) par le serveur (informations manquantes ou invalides).`,
        });
      if (resultat.doublons)
        erreurs.push({
          ligne: 0,
          message: `${resultat.doublons} doublon(s) détecté(s) (e-mail, NIF ou STAT déjà enregistrés) — aucune création en double.`,
        });
      const nouveauxDoublons = analyse.filter((ligne) => ligne.doublon).length;
      const totalIgnores = lignesLocalesIgnorees + resultat.ignorees;
      let statutImport: ImportHistoryEntry["statut"];
      if (totalIgnores === 0) {
        statutImport = "TERMINE";
      } else if (resultat.creees > 0) {
        statutImport = "PARTIEL";
      } else {
        statutImport = "ERREUR";
      }
      const rapportImport: ImportHistoryEntry = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
        nomFichier: fichierNom,
        date: new Date().toISOString(),
        analysees: analyse.length,
        creees: resultat.creees,
        ignorees: totalIgnores,
        doublons: nouveauxDoublons + resultat.ignorees,
        erreurs,
        statut: statutImport,
      };
      setRapport(rapportImport);
      notifier(
        `${resultat.creees} profil(s) créé(s), dont ${resultat.comptesCrees ?? 0} compte(s) entreprise(s) avec e-mail d’activation.`,
        resultat.creees ? "succes" : "avertissement",
      );
    } catch (cause) {
      setErreur(
        cause instanceof Error ? cause.message : "Le serveur n’a pas effectué l’import.",
      );
    } finally {
      setChargement(false);
    }
  };

  const reinitialiser = () => {
    setFeuilles([]);
    setNomFeuille("");
    setFichierNom("");
    setEnTetes([]);
    setLignesExcel([]);
    setMapping(mappingVide);
    setAnalyse(null);
    setErreur("");
    setRapport(null);
    setEmailsImport([]);
  };

  /** Réessai d'envoi d'un e-mail de première connexion en échec (jeton réémis). */
  const renvoyerEmail = async (demandeId: string, destinataire: string) => {
    if (!session?.jetonApi) return;
    setRenvoiEnCours(demandeId);
    try {
      const resultat = await callApi<{ statutCourriel: string }>(
        `utilisateurs/emails-activation/${encodeURIComponent(demandeId)}/renvoyer`,
        { method: "POST", token: session.jetonApi },
      );
      setEmailsImport((courant) =>
        courant.map((email) =>
          email.demandeId === demandeId
            ? { ...email, statutCourriel: resultat.statutCourriel }
            : email,
        ),
      );
      notifier(
        resultat.statutCourriel === "ENVOYEE"
          ? `E-mail renvoyé à ${destinataire}.`
          : `L'envoi à ${destinataire} a de nouveau échoué.`,
        resultat.statutCourriel === "ENVOYEE" ? "succes" : "erreur",
      );
    } catch (cause) {
      notifier(
        cause instanceof Error ? cause.message : "Le renvoi a échoué.",
        "erreur",
      );
    } finally {
      setRenvoiEnCours(null);
    }
  };

  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre="Import Excel"
        description={`Importez des profils contribuables de ${SRE_REGION} après aperçu et validation des lignes.`}
        filAriane={["Accueil", "Import Excel"]}
      />
      {!feuilles.length ? (
        <section className="carte-sre zone-depot-excel-sre">
          <span className="zone-depot-excel-sre__icone">
            <FileSpreadsheet size={26} />
          </span>
          <h2>Sélectionner un classeur Excel</h2>
          <p>
            Importez un fichier .xlsx avec une ligne d’en-tête. Vous pourrez choisir la feuille,
            mapper les colonnes et valider les lignes avant l’enregistrement serveur.
          </p>
          <label className="bouton-sre bouton-sre--primaire" aria-disabled={chargement}>
            <Upload size={15} aria-hidden="true" /> Choisir un fichier .xlsx
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={lireFichier}
              disabled={chargement}
            />
          </label>
          <a
            className="lien-modele-import-sre"
            href="/modele-import-contribuables-sre.xlsx"
            download
          >
            <ArrowDownToLine size={14} /> Télécharger le modèle vierge (sans exemple)
          </a>
          {chargement && (
            <p className="texte-secondaire-sre flex items-center gap-2" aria-live="polite">
              <CoreSpinLoader libelle="Lecture du classeur…" taille={16} compact />
              Lecture du classeur…
            </p>
          )}
          {erreur && (
            <p className="message-erreur-sre" role="alert">
              {erreur}
            </p>
          )}
          <div className="aide-import-sre">
            <strong>Colonnes à mapper :</strong>
            <p>
              Nom ou raison sociale, e-mail, téléphone, adresse, région {SRE_REGION} et
              ville/commune. NIF et STAT restent facultatifs.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="carte-sre import-fichier-sre">
            <div>
              <span className="icone-fichier-sre">
                <FileSpreadsheet size={19} />
              </span>
              <div>
                <strong>{fichierNom}</strong>
                <small>
                  {lignesExcel.length} ligne(s) de données · {feuilles.length} feuille(s)
                </small>
              </div>
            </div>
            <div className="actions-tableau-sre">
              {feuilles.length > 1 && (
                <label className="filtre-compact-sre">
                  Feuille
                  <Select
                    value={nomFeuille}
                    onChange={(event) => choisirFeuille(event.target.value)}
                  >
                    {feuilles.map((feuille) => (
                      <option key={feuille.sheet} value={feuille.sheet}>
                        {feuille.sheet}
                      </option>
                    ))}
                  </Select>
                </label>
              )}
              <Button variante="contour" taille="petit" onClick={reinitialiser}>
                <RotateCcw size={14} /> Remplacer le fichier
              </Button>
            </div>
          </section>
          {erreur && (
            <p className="message-erreur-sre" role="alert">
              {erreur}
            </p>
          )}
          <section className="carte-sre">
            <div className="carte-sre__entete">
              <div>
                <h2>1. Mapper les colonnes</h2>
                <p>Les champs requis sont indiqués. La région doit correspondre à {SRE_REGION}.</p>
              </div>
              <span className="etape-import-badge-sre">1 / 3</span>
            </div>
            <div className="grille-mapping-excel-sre">
              {MAPPING_FIELDS.map(({ champ, libelle, obligatoire }) => (
                <label key={champ}>
                  {libelle}
                  {obligatoire && <em> requis</em>}
                  <Select
                    className="champ-simple-sre"
                    value={mapping[champ]}
                    onChange={(event) => changerMapping(champ, event.target.value)}
                  >
                    <option value="">Non mappé</option>
                    {enTetes.map((entete, index) => (
                      <option key={`${index}-${entete}`} value={String(index)}>
                        {entete}
                      </option>
                    ))}
                  </Select>
                </label>
              ))}
            </div>
          </section>
          <section className="carte-sre">
            <div className="carte-sre__entete">
              <div>
                <h2>2. Aperçu des données</h2>
                <p>Les premières lignes de la feuille « {nomFeuille} »</p>
              </div>
              <span className="etape-import-badge-sre">
                {Math.min(5, lignesExcel.length)} / {lignesExcel.length}
              </span>
            </div>
            <div className="tableau-defilement-sre">
              <table className="tableau-sre tableau-apercu-excel-sre">
                <thead>
                  <tr>
                    <th>Ligne</th>
                    {enTetes.slice(0, 8).map((entete, index) => (
                      <th key={`${index}-${entete}`}>{entete}</th>
                    ))}
                    {enTetes.length > 8 && <th>…</th>}
                  </tr>
                </thead>
                <tbody>
                  {(feuilleActive?.data.slice(1, 6) ?? []).map((ligne, index) => (
                    <tr key={`${index + 2}-${JSON.stringify(ligne)}`}>
                      <td data-label="Ligne Excel">{index + 2}</td>
                      {enTetes.slice(0, 8).map((entete, cellule) => (
                        <td
                          data-label={entete || `Colonne ${cellule + 1}`}
                          key={entete || `colonne-${cellule + 1}`}
                        >
                          {texteCellule(ligne[cellule]) || "—"}
                        </td>
                      ))}
                      {enTetes.length > 8 && <td data-label="Autres colonnes">…</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="actions-bas-page-sre">
              <Button onClick={analyser} disabled={chargement || !colonnesValides}>
                <CheckCircle2 size={15} /> 3. Analyser et valider
              </Button>
            </div>
          </section>
          {analyse && (
            <section className="carte-sre resultat-analyse-sre">
              <div className="carte-sre__entete">
                <div>
                  <h2>Résultat de l’analyse</h2>
                  <p>
                    {analyse.length} ligne(s) non vides examinées. Rien n’est enregistré avant
                    confirmation.
                  </p>
                </div>
                <label className="filtre-compact-sre">
                  Afficher
                  <Select
                    value={filtreLignes}
                    onChange={(event) => setFiltreLignes(event.target.value)}
                  >
                    <option value="TOUS">Toutes</option>
                    <option value="VALIDES">Valides</option>
                    <option value="DOUBLONS">Doublons</option>
                    <option value="ERREURS">Erreurs</option>
                  </Select>
                </label>
              </div>
              <div className="resume-analyse-import-sre">
                <div className="resume-analyse-import-sre__valide">
                  <strong>{analyse.filter((ligne) => ligne.profil).length}</strong>
                  <span>Prêtes à importer</span>
                </div>
                <div className="resume-analyse-import-sre__doublon">
                  <strong>{analyse.filter((ligne) => ligne.doublon).length}</strong>
                  <span>Doublons dans le fichier</span>
                </div>
                <div className="resume-analyse-import-sre__erreur">
                  <strong>
                    {analyse.filter((ligne) => ligne.erreurs.length && !ligne.doublon).length}
                  </strong>
                  <span>Lignes en erreur</span>
                </div>
              </div>
              <div className="tableau-defilement-sre">
                <table className="tableau-sre">
                  <thead>
                    <tr>
                      <th>Ligne Excel</th>
                      <th>Type</th>
                      <th>Nom / raison sociale</th>
                      <th>NIF</th>
                      <th>E-mail</th>
                      <th>Résultat</th>
                      <th>Motif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignesAnalysees.slice(0, 100).map((ligne) => {
                      let statutResultat = "ACTIF";
                      if (ligne.erreurs.length) {
                        statutResultat = "ERREUR";
                      }
                      if (ligne.doublon) {
                        statutResultat = "REJETE";
                      }

                      return (
                      <tr key={ligne.numero}>
                        <td data-label="Ligne Excel">{ligne.numero}</td>
                        <td data-label="Type">{ligne.profil ? <StatusBadge statut={ligne.profil.type} /> : "—"}</td>
                        <td data-label="Nom / raison sociale">
                          {ligne.profil?.raisonSociale ||
                            `${ligne.profil?.prenom ?? ""} ${ligne.profil?.nom ?? ""}`.trim() ||
                            "—"}
                        </td>
                        <td data-label="NIF">{ligne.profil?.nif ?? "—"}</td>
                        <td data-label="E-mail">{ligne.profil?.courriel ?? "—"}</td>
                        <td data-label="Résultat">
                          <StatusBadge statut={statutResultat} />
                        </td>
                        <td data-label="Motif">
                          {ligne.erreurs.map((ligneErreur) => (
                            <small
                              key={`${ligne.numero}-${ligneErreur.champ ?? ""}-${ligneErreur.message}`}
                              className="erreur-import-ligne-sre"
                            >
                              {ligneErreur.champ ? `${ligneErreur.champ} : ` : ""}
                              {ligneErreur.message}
                            </small>
                          ))}
                          {!ligne.erreurs.length && !ligne.doublon && (
                            <span className="texte-succes-sre">Prête à enregistrer</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                {lignesAnalysees.length > 100 && (
                  <p className="texte-secondaire-sre">
                    Les 100 premières lignes filtrées sont affichées. L’analyse porte sur toute la
                    feuille.
                  </p>
                )}
              </div>
              <div className="actions-bas-page-sre">
                <Button variante="contour" onClick={analyser}>
                  Relancer la validation
                </Button>
                <Button
                  onClick={() => void lancerImport()}
                  disabled={
                    analyse.every(
                      (ligne) => !ligne.profil || ligne.doublon || ligne.erreurs.length > 0,
                    )
                  }
                  chargement={chargement}
                >
                  {chargement ? (
                    "Enregistrement…"
                  ) : (
                    <>
                      Enregistrer les profils valides (
                      {
                        analyse.filter(
                          (ligne) => ligne.profil && !ligne.doublon && !ligne.erreurs.length,
                        ).length
                      }
                      ) <ArrowRight size={15} />
                    </>
                  )}
                </Button>
              </div>
              {erreur && (
                <p className="message-erreur-sre" role="alert">
                  {erreur}
                </p>
              )}
            </section>
          )}
        </>
      )}
      {rapport && (
        <section className="carte-sre rapport-import-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Rapport de l’import</h2>
              <p>
                {rapport.nomFichier} · {formatDate(rapport.date, true)}
              </p>
            </div>
            <StatusBadge statut={rapport.statut} />
          </div>
          <div className="resume-analyse-import-sre">
            <div className="resume-analyse-import-sre__valide">
              <strong>{rapport.creees}</strong>
              <span>Profils créés</span>
            </div>
            <div>
              <strong>{rapport.analysees}</strong>
              <span>Lignes analysées</span>
            </div>
            <div className="resume-analyse-import-sre__doublon">
              <strong>{rapport.doublons}</strong>
              <span>Doublons détectés</span>
            </div>
            <div className="resume-analyse-import-sre__erreur">
              <strong>{rapport.ignorees}</strong>
              <span>Lignes ignorées</span>
            </div>
          </div>
          {rapport.erreurs.length > 0 && (
            <details className="details-erreurs-import-sre">
              <summary>
                <CircleAlert size={15} /> Afficher les erreurs et doublons ({rapport.erreurs.length}
                )
              </summary>
              <ul>
                {rapport.erreurs.slice(0, 100).map((ligne, index) => {
                  const prefixeLigne = ligne.ligne > 0 ? `Ligne ${ligne.ligne}` : "";
                  const champ = ligne.ligne > 0 && ligne.champ ? ` · ${ligne.champ}` : "";
                  const separateur = ligne.ligne > 0 ? " — " : "";

                  return (
                    <li key={`${ligne.ligne}-${index}`}>
                      {prefixeLigne}
                      {champ}
                      {separateur}
                      {ligne.message}
                    </li>
                  );
                })}
              </ul>
            </details>
          )}
          <div className="note-securite-sre">
            <ShieldCheck size={16} />
            <p>
              <strong>Import terminé par le serveur.</strong>
              <span>
                Les comptes entreprise créés doivent terminer leur configuration initiale (nouveau
                mot de passe + profil) avant d’accéder aux fonctionnalités ; le mot de passe
                provisoire est invalidé à cette étape.
              </span>
            </p>
          </div>
          {emailsImport.length > 0 && (
            <div className="rapport-emails-activation-sre">
              <strong>
                <MailCheck size={15} aria-hidden="true" /> E-mails de première connexion (
                {emailsImport.filter((e) => e.statutCourriel === "ENVOYEE").length} envoyé(s),{" "}
                {emailsImport.filter((e) => e.statutCourriel === "ECHEC").length} en échec)
              </strong>
              <ul>
                {emailsImport.map((email) => {
                  const classeBadgeCourriel =
                    email.statutCourriel === "ENVOYEE"
                      ? "badge-sre badge-sre--succes"
                      : email.statutCourriel === "ECHEC"
                        ? "badge-sre badge-sre--erreur"
                        : "badge-sre badge-sre--attention";

                  return (
                    <li key={email.compteId}>
                      <span>{email.destinataire}</span>
                      <span className={classeBadgeCourriel}>
                        {email.statutCourriel === "ENVOYEE"
                          ? "Envoyé"
                          : email.statutCourriel === "ECHEC"
                            ? "Échec"
                            : "En attente"}
                      </span>
                      {email.statutCourriel === "ECHEC" && email.demandeId && (
                        <button
                          type="button"
                          className="bouton-sre bouton-sre--contour bouton-sre--petit"
                          disabled={renvoiEnCours === email.demandeId}
                          onClick={() => renvoyerEmail(email.demandeId as string, email.destinataire)}
                        >
                          {renvoiEnCours === email.demandeId ? "Envoi…" : "Renvoyer"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
