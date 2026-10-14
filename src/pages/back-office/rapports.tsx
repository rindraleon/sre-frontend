import { useMemo, useState } from "react";
import { ArrowDownToLine, ChartNoAxesCombined, CircleDollarSign, Users } from "lucide-react";
import { utiliserSre } from "@/contexte/contexte-sre";
import { BadgeSre, BoutonSre, EntetePageSre, EtatVideSre } from "@/composants/ui/composants-sre";
import { formaterArgent } from "@/utilitaires/formatage";

function protegerCsv(valeur: string | number) {
  return `"${String(valeur).replaceAll('"', '""')}"`;
}
export function RapportsAdministrationSre() {
  const { etat, notifier } = utiliserSre();
  const aujourdHui = new Date().toISOString().slice(0, 10);
  const ilYADouzeMois = new Date();
  ilYADouzeMois.setFullYear(ilYADouzeMois.getFullYear() - 1);
  const [debut, definirDebut] = useState(ilYADouzeMois.toISOString().slice(0, 10));
  const [fin, definirFin] = useState(aujourdHui);
  const [typeContribuable, definirTypeContribuable] = useState("TOUS");
  const contribuablesFiltres = useMemo(
    () =>
      etat.contribuables
        .filter(
          (contribuable) => typeContribuable === "TOUS" || contribuable.type === typeContribuable,
        )
        .filter((contribuable) => !debut || contribuable.dateCreationCompte.slice(0, 10) >= debut)
        .filter((contribuable) => !fin || contribuable.dateCreationCompte.slice(0, 10) <= fin),
    [etat.contribuables, typeContribuable, debut, fin],
  );
  const paiementsFiltres = useMemo(
    () =>
      etat.paiements
        .filter((paiement) => {
          const contribuable = etat.contribuables.find(
            (entree) => entree.id === paiement.contribuableId,
          );
          return (
            contribuable && (typeContribuable === "TOUS" || contribuable.type === typeContribuable)
          );
        })
        .filter((paiement) => !debut || paiement.soumisLe.slice(0, 10) >= debut)
        .filter((paiement) => !fin || paiement.soumisLe.slice(0, 10) <= fin),
    [etat.paiements, etat.contribuables, typeContribuable, debut, fin],
  );
  const confirmes = paiementsFiltres.filter((paiement) => paiement.statut === "CONFIRME");
  const attente = paiementsFiltres.filter((paiement) => paiement.statut === "EN_VERIFICATION");
  const montantConfirme = confirmes.reduce((somme, paiement) => somme + paiement.montant, 0);
  const montantAttente = attente.reduce((somme, paiement) => somme + paiement.montant, 0);
  const donneesParType = ["PARTICULIER", "ENTREPRISE"].map((type) => {
    const comptes = contribuablesFiltres.filter((contribuable) => contribuable.type === type);
    const paiements = paiementsFiltres.filter((paiement) =>
      comptes.some((contribuable) => contribuable.id === paiement.contribuableId),
    );
    return {
      type,
      comptes: comptes.length,
      paiements: paiements.length,
      confirme: paiements
        .filter((paiement) => paiement.statut === "CONFIRME")
        .reduce((somme, paiement) => somme + paiement.montant, 0),
    };
  });
  const donneesParStatut = ["EN_VERIFICATION", "CONFIRME", "REJETE", "CORRECTION_DEMANDEE"].map(
    (statut) => ({
      statut,
      nombre: paiementsFiltres.filter((paiement) => paiement.statut === statut).length,
      montant: paiementsFiltres
        .filter((paiement) => paiement.statut === statut)
        .reduce((somme, paiement) => somme + paiement.montant, 0),
    }),
  );
  const exporter = () => {
    const lignes = [
      ["Période début", debut],
      ["Période fin", fin],
      [],
      ["Type contribuable", "Comptes", "Déclarations", "Montant confirmé en interne (MGA)"],
      ...donneesParType.map((entree) => [
        entree.type,
        entree.comptes,
        entree.paiements,
        entree.confirme,
      ]),
      [],
      ["Statut déclaration", "Nombre", "Montant déclaré (MGA)"],
      ...donneesParStatut.map((entree) => [entree.statut, entree.nombre, entree.montant]),
    ];
    const csv =
      "\uFEFF" +
      lignes
        .map((ligne) => ligne.map((cellule) => protegerCsv(cellule ?? "")).join(";"))
        .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `rapport-sre-${aujourdHui}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
    notifier("Rapport agrégé exporté en CSV.", "succes");
  };
  const serieMensuelle = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        const lignes = paiementsFiltres.filter((paiement) => {
          const dateRef = new Date(paiement.valideLe ?? paiement.soumisLe);
          return (
            dateRef.getMonth() === date.getMonth() &&
            dateRef.getFullYear() === date.getFullYear() &&
            paiement.statut === "CONFIRME"
          );
        });
        return {
          mois: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date),
          montant: lignes.reduce((somme, paiement) => somme + paiement.montant, 0),
        };
      }),
    [paiementsFiltres],
  );
  const maximum = Math.max(...serieMensuelle.map((mois) => mois.montant), 1);
  return (
    <div className="page-contenu-sre">
      <EntetePageSre
        titre="Rapports & statistiques"
        description="Indicateurs calculés à partir des données transmises par le serveur."
        filAriane={["Back-office", "Rapports & statistiques"]}
        actions={
          <BoutonSre variante="contour" onClick={exporter}>
            <ArrowDownToLine size={15} /> Exporter CSV
          </BoutonSre>
        }
      />
      <div className="carte-sre filtres-rapport-sre">
        <label>
          Période du
          <input
            className="champ-simple-sre"
            type="date"
            value={debut}
            max={fin || aujourdHui}
            onChange={(event) => definirDebut(event.target.value)}
          />
        </label>
        <label>
          Au
          <input
            className="champ-simple-sre"
            type="date"
            value={fin}
            min={debut}
            max={aujourdHui}
            onChange={(event) => definirFin(event.target.value)}
          />
        </label>
        <label>
          Type de contribuable
          <select
            className="champ-simple-sre"
            value={typeContribuable}
            onChange={(event) => definirTypeContribuable(event.target.value)}
          >
            <option value="TOUS">Tous</option>
            <option value="PARTICULIER">Particuliers</option>
            <option value="ENTREPRISE">Entreprises</option>
          </select>
        </label>
        <span>{contribuablesFiltres.length} contribuable(s) inclus</span>
      </div>
      <section className="grille-statistiques-sre">
        <article className="carte-stat-sre">
          <span className="carte-stat-sre__icone carte-stat-sre__icone--bleu">
            <Users size={18} />
          </span>
          <div>
            <span>Comptes créés</span>
            <strong>{contribuablesFiltres.length}</strong>
            <small>Profils dans la période choisie</small>
          </div>
        </article>
        <article className="carte-stat-sre">
          <span className="carte-stat-sre__icone carte-stat-sre__icone--vert">
            <CircleDollarSign size={18} />
          </span>
          <div>
            <span>Montants confirmés</span>
            <strong className="valeur-stat-texte-sre">{formaterArgent(montantConfirme)}</strong>
            <small>{confirmes.length} décision(s) explicite(s)</small>
          </div>
        </article>
        <article className="carte-stat-sre">
          <span className="carte-stat-sre__icone carte-stat-sre__icone--orange">
            <ChartNoAxesCombined size={18} />
          </span>
          <div>
            <span>En vérification</span>
            <strong>{attente.length}</strong>
            <small>{formaterArgent(montantAttente)} déclaré(s), non confirmé(s)</small>
          </div>
        </article>
      </section>
      <div className="grille-contenu-sre">
        <section className="carte-sre graphique-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Montants confirmés par mois</h2>
              <p>Six derniers mois de la période · MGA</p>
            </div>
            <ChartNoAxesCombined size={18} />
          </div>
          {paiementsFiltres.length ? (
            <div className="graphique-sre__contenu">
              <div className="graphique-sre__valeur">{formaterArgent(montantConfirme)}</div>
              <div className="barres-mois-sre">
                {serieMensuelle.map((mois) => (
                  <div key={mois.mois}>
                    <span
                      title={formaterArgent(mois.montant)}
                      style={{ height: `${Math.max(6, (mois.montant / maximum) * 100)}%` }}
                    />
                    <small>{mois.mois}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EtatVideSre
              titre="Aucune déclaration sur la période"
              description="Modifiez les dates ou consultez le rapport lorsque des déclarations seront enregistrées."
            />
          )}
        </section>
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Répartition par statut</h2>
              <p>Montants déclarés, sans confirmation automatique</p>
            </div>
          </div>
          {donneesParStatut.map((entree) => (
            <div className="ligne-statut-rapport-sre" key={entree.statut}>
              <BadgeSre statut={entree.statut} />
              <div>
                <strong>{entree.nombre}</strong>
                <small>{formaterArgent(entree.montant)}</small>
              </div>
            </div>
          ))}
        </section>
      </div>
      <section className="carte-sre">
        <div className="carte-sre__entete">
          <div>
            <h2>Répartition par profil</h2>
            <p>Comptes et décisions agrégés</p>
          </div>
        </div>
        <div className="tableau-defilement-sre">
          <table className="tableau-sre">
            <thead>
              <tr>
                <th>Type de contribuable</th>
                <th>Profils</th>
                <th>Déclarations</th>
                <th>Montant confirmé en interne</th>
              </tr>
            </thead>
            <tbody>
              {donneesParType.map((entree) => (
                <tr key={entree.type}>
                  <td>
                    <BadgeSre statut={entree.type} />
                  </td>
                  <td>{entree.comptes}</td>
                  <td>{entree.paiements}</td>
                  <td>{formaterArgent(entree.confirme)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="note-fiscale-sre">
        <span>i</span>
        <p>
          Les montants confirmés reflètent les décisions administratives enregistrées. Ils ne
          constituent ni une vérification bancaire, ni un état de recettes officiel.
        </p>
      </div>
    </div>
  );
}
