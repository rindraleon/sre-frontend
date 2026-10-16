import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CirclePlus, UserRound } from "lucide-react";
import { useSre } from "@/context/SreContext";
import { ROUTES_ADMIN, SRE_REGION } from "@/constants";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import { formatDate } from "@/utils/format";

export function AdminTaxpayerDetailPage() {
  const { id } = useParams();
  const { etat } = useSre();
  const contribuable = etat.contribuables.find((entree) => entree.id === id);
  if (!contribuable)
    return (
      <div className="page-contenu-sre">
        <PageHeader titre="Contribuable introuvable" filAriane={["Back-office", "Contribuables"]} />
        <EmptyState
          titre="Profil non trouvé"
          description="Ce profil n’existe pas dans les données accessibles à votre session."
          action={
            <Link to={ROUTES_ADMIN.contribuables} className="bouton-sre bouton-sre--contour">
              <ArrowLeft size={14} /> Retour à la liste
            </Link>
          }
        />
      </div>
    );
  const utilisateur = etat.utilisateurs.find((compte) => compte.id === contribuable.utilisateurId);
  const obligations = etat.obligations.filter(
    (entree) => entree.contribuableId === contribuable.id,
  );
  const paiements = etat.paiements.filter((entree) => entree.contribuableId === contribuable.id);
  return (
    <div className="page-contenu-sre">
      <PageHeader
        titre={
          contribuable.raisonSociale || `${contribuable.prenom ?? ""} ${contribuable.nom}`.trim()
        }
        description={`${contribuable.type === "ENTREPRISE" ? "Entreprise" : "Particulier"} · ${SRE_REGION}`}
        filAriane={["Back-office", "Contribuables", contribuable.nif || contribuable.id]}
        actions={
          <Link className="bouton-sre bouton-sre--contour" to={ROUTES_ADMIN.contribuables}>
            <ArrowLeft size={14} /> Retour
          </Link>
        }
      />
      <div className="grille-statistiques-sre">
        <article className="carte-stat-sre">
          <span className="carte-stat-sre__icone carte-stat-sre__icone--bleu">
            <UserRound size={18} />
          </span>
          <div>
            <span>Compte lié</span>
            <strong className="valeur-stat-texte-sre">
              {utilisateur?.courriel ?? "Sans compte lié"}
            </strong>
            <small>{utilisateur ? "Compte utilisateur" : "Profil sans compte"}</small>
          </div>
        </article>
        <article className="carte-stat-sre">
          <span className="carte-stat-sre__icone carte-stat-sre__icone--orange">
            <CirclePlus size={18} />
          </span>
          <div>
            <span>Obligations</span>
            <strong>{obligations.length}</strong>
            <small>
              {obligations.filter((entree) => entree.statut !== "PAYE").length} à suivre
            </small>
          </div>
        </article>
        <article className="carte-stat-sre">
          <span className="carte-stat-sre__icone carte-stat-sre__icone--vert">
            <ArrowRight size={18} />
          </span>
          <div>
            <span>Déclarations</span>
            <strong>{paiements.length}</strong>
            <small>
              dont {paiements.filter((entree) => entree.statut === "EN_VERIFICATION").length} à
              vérifier
            </small>
          </div>
        </article>
      </div>
      <div className="grille-contenu-sre">
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Informations du profil</h2>
              <p>Source : dossier enregistré dans le serveur.</p>
            </div>
            <StatusBadge statut={utilisateur?.statut ?? "SANS_COMPTE"} />
          </div>
          <dl className="liste-details-sre">
            <div>
              <dt>Type</dt>
              <dd>
                <StatusBadge statut={contribuable.type} />
              </dd>
            </div>
            <div>
              <dt>NIF</dt>
              <dd>{contribuable.nif || "Non renseigné"}</dd>
            </div>
            {contribuable.stat && (
              <div>
                <dt>STAT</dt>
                <dd>{contribuable.stat}</dd>
              </div>
            )}
            <div>
              <dt>Adresse</dt>
              <dd>
                {contribuable.adresse}, {contribuable.ville}, {contribuable.region}
              </dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{contribuable.courriel}</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>{contribuable.telephone || "—"}</dd>
            </div>
            {contribuable.representantLegal && (
              <div>
                <dt>Représentant légal</dt>
                <dd>{contribuable.representantLegal}</dd>
              </div>
            )}
            <div>
              <dt>Compte utilisateur</dt>
              <dd>{utilisateur?.courriel ?? "Aucun compte lié"}</dd>
            </div>
            <div>
              <dt>Créé le</dt>
              <dd>{formatDate(contribuable.dateCreationCompte, true)}</dd>
            </div>
          </dl>
        </section>
        <section className="carte-sre">
          <div className="carte-sre__entete">
            <div>
              <h2>Obligations associées</h2>
              <p>Selon les données renvoyées par le serveur.</p>
            </div>
            <Link className="lien-discret-sre" to={ROUTES_ADMIN.obligations}>
              Gérer <ArrowRight size={14} />
            </Link>
          </div>
          {obligations.length ? (
            obligations.map((obligation) => (
              <div className="ligne-obligation-mini-sre" key={obligation.id}>
                <div>
                  <strong>{obligation.typeImpotNom}</strong>
                  <small>
                    {obligation.referenceFiscale} · {obligation.periode}
                  </small>
                </div>
                <span>{new Intl.NumberFormat("fr-FR").format(obligation.montant)} MGA</span>
                <StatusBadge statut={obligation.statut} />
              </div>
            ))
          ) : (
            <EmptyState
              titre="Aucune obligation liée"
              description="Aucune obligation n’est actuellement associée à ce profil."
            />
          )}
        </section>
      </div>
    </div>
  );
}
