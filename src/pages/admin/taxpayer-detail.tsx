import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CirclePlus, UserRound } from "lucide-react";
import { useSre } from "@/contexts";
import { ROUTES_ADMIN, SRE_REGION } from "@/data";
import {
  CARD_CLASS,
  CARD_HEADER_CLASS,
  CONTENT_GRID_CLASS,
  DETAILS_LIST_CLASS,
  EmptyState,
  OBLIGATION_MINI_ROW_CLASS,
  PAGE_CONTENT_CLASS,
  PageHeader,
  STATISTICS_GRID_CLASS,
  STAT_CARD_SRE_CLASS,
  STAT_TEXT_VALUE_CLASS,
  SUBTLE_LINK_CLASS,
  StatusBadge,
  buttonVariants,
  statCardIconClass,
} from "@/components";
import { formatDate } from "@/utils";

export function AdminTaxpayerDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { state } = useSre();
  const listParent = location.pathname.startsWith("/admin/entreprises")
    ? "Entreprises"
    : "Contribuables";
  const taxpayer = state.taxpayers.find((entry) => entry.id === id);
  if (!taxpayer)
    return (
      <div className={PAGE_CONTENT_CLASS}>
        <PageHeader title="Contribuable introuvable" breadcrumb={["Accueil", listParent]} />
        <EmptyState
          title="Profil non trouvé"
          description="Ce profil n’existe pas dans les données accessibles à votre session."
          action={
            <Link to={ROUTES_ADMIN.taxpayers} className={buttonVariants({ variant: "outline" })}>
              <ArrowLeft size={14} /> Retour à la liste
            </Link>
          }
        />
      </div>
    );
  const user = state.users.find((account) => account.id === taxpayer.userId);
  const obligations = state.obligations.filter((entry) => entry.taxpayerId === taxpayer.id);
  const payments = state.payments.filter((entry) => entry.taxpayerId === taxpayer.id);
  return (
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title={taxpayer.legalName || `${taxpayer.firstName ?? ""} ${taxpayer.lastName}`.trim()}
        description={`${taxpayer.type === "ENTREPRISE" ? "Entreprise" : "Particulier"} · ${SRE_REGION}`}
        breadcrumb={["Accueil", listParent, taxpayer.nif || taxpayer.id]}
        actions={
          <Link className={buttonVariants({ variant: "outline" })} to={ROUTES_ADMIN.taxpayers}>
            <ArrowLeft size={14} /> Retour
          </Link>
        }
      />
      <div className={STATISTICS_GRID_CLASS}>
        <article className={STAT_CARD_SRE_CLASS}>
          <span className={statCardIconClass("blue")}>
            <UserRound size={18} />
          </span>
          <div>
            <span>Compte lié</span>
            <strong className={STAT_TEXT_VALUE_CLASS}>{user?.email ?? "Sans compte lié"}</strong>
            <small>{user ? "Compte utilisateur" : "Profil sans compte"}</small>
          </div>
        </article>
        <article className={STAT_CARD_SRE_CLASS}>
          <span className={statCardIconClass("orange")}>
            <CirclePlus size={18} />
          </span>
          <div>
            <span>Obligations</span>
            <strong>{obligations.length}</strong>
            <small>{obligations.filter((entry) => entry.status !== "PAYE").length} à suivre</small>
          </div>
        </article>
        <article className={STAT_CARD_SRE_CLASS}>
          <span className={statCardIconClass("green")}>
            <ArrowRight size={18} />
          </span>
          <div>
            <span>Déclarations</span>
            <strong>{payments.length}</strong>
            <small>
              dont {payments.filter((entry) => entry.status === "EN_VERIFICATION").length} à
              vérifier
            </small>
          </div>
        </article>
      </div>
      <div className={CONTENT_GRID_CLASS}>
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Informations du profil</h2>
              <p>Source : dossier enregistré dans le serveur.</p>
            </div>
            <StatusBadge status={user?.status ?? "SANS_COMPTE"} />
          </div>
          <dl className={DETAILS_LIST_CLASS}>
            <div>
              <dt>Type</dt>
              <dd>
                <StatusBadge status={taxpayer.type} />
              </dd>
            </div>
            <div>
              <dt>NIF</dt>
              <dd>{taxpayer.nif || "Non renseigné"}</dd>
            </div>
            {taxpayer.stat && (
              <div>
                <dt>STAT</dt>
                <dd>{taxpayer.stat}</dd>
              </div>
            )}
            <div>
              <dt>Adresse</dt>
              <dd>
                {taxpayer.address}, {taxpayer.city}, {taxpayer.region}
              </dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{taxpayer.email}</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>{taxpayer.phone || "—"}</dd>
            </div>
            {taxpayer.legalRepresentative && (
              <div>
                <dt>Représentant légal</dt>
                <dd>{taxpayer.legalRepresentative}</dd>
              </div>
            )}
            <div>
              <dt>Compte utilisateur</dt>
              <dd>{user?.email ?? "Aucun compte lié"}</dd>
            </div>
            <div>
              <dt>Créé le</dt>
              <dd>{formatDate(taxpayer.accountCreatedAt, true)}</dd>
            </div>
          </dl>
        </section>
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Obligations associées</h2>
              <p>Selon les données renvoyées par le serveur.</p>
            </div>
            <Link className={SUBTLE_LINK_CLASS} to={ROUTES_ADMIN.obligations}>
              Gérer <ArrowRight size={14} />
            </Link>
          </div>
          {obligations.length ? (
            obligations.map((obligation) => (
              <div className={OBLIGATION_MINI_ROW_CLASS} key={obligation.id}>
                <div>
                  <strong>{obligation.taxTypeName}</strong>
                  <small>
                    {obligation.taxReference} · {obligation.period}
                  </small>
                </div>
                <span>{new Intl.NumberFormat("fr-FR").format(obligation.amount)} MGA</span>
                <StatusBadge status={obligation.status} />
              </div>
            ))
          ) : (
            <EmptyState
              title="Aucune obligation liée"
              description="Aucune obligation n’est actuellement associée à ce profil."
            />
          )}
        </section>
      </div>
    </div>
  );
}
