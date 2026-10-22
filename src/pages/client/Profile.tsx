import { useEffect } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiTaxpayer, type ApiTaxpayer } from "@/services/api-client";
import { StatusBadge, PageHeader, EmptyState } from "@/components/ui";
import { formatDate } from "@/utils/format";
import { MSG_RECORD_FAILURE, MSG_SESSION_MISSING, ROUTES_CLIENT } from "@/constants";
import { useApiForm } from "@/hooks";
import { SubmitButton } from "@/components/forms/form-field";
import { ClientProfileFormFields, CONTACT_DETAILS_EMPTY } from "@/components/forms/client/profile-form";
import { clientProfileSchema, type ClientProfileFormValues } from "@/validation/profile.schema";

export function ClientProfilePage() {
  const { session } = useAuth();
  const { state, updateState, notify } = useSre();
  const taxpayer = state.taxpayers.find((entry) => entry.id === session?.taxpayerId);
  const form = useApiForm<ClientProfileFormValues>({
    schema: clientProfileSchema,
    initialValues: CONTACT_DETAILS_EMPTY,
    fallbackMessage: MSG_RECORD_FAILURE,
  });

  useEffect(() => {
    if (!taxpayer) return;
    form.resetForm({
      adresse: taxpayer.address,
      ville: taxpayer.city,
      telephone: taxpayer.phone,
      nomCommercial: taxpayer.tradeName ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxpayer?.id]);

  if (!taxpayer)
    return (
      <div className="page-content-sre">
        <PageHeader title="Profil fiscal" breadcrumb={["Accueil", "Profil fiscal"]} />
        <EmptyState
          title="Profil non disponible"
          description="Aucun profil contribuable n’est associé à votre session."
        />
      </div>
    );

  const save = form.handleSubmit(async (values) => {
    form.resetError();
    if (!session?.apiToken) {
      form.setError(MSG_SESSION_MISSING);
      return;
    }
    try {
      const response = await callApi<ApiTaxpayer>("contribuables/moi", {
        method: "PATCH",
        token: session.apiToken,
        body: {
          adresse: values.adresse.trim(),
          ville: values.ville.trim(),
          telephone: values.telephone.trim(),
          ...(taxpayer.type === "ENTREPRISE"
            ? { nomCommercial: values.nomCommercial.trim() }
            : {}),
        },
      });
      const updatedProfile = mapApiTaxpayer(response, session.userId);
      updateState((current) => ({
        ...current,
        taxpayers: current.taxpayers.map((entry) =>
          entry.id === updatedProfile.id ? updatedProfile : entry,
        ),
      }));
      notify("Coordonnées enregistrées sur le serveur.", "success");
    } catch (cause) {
      form.handleFailure(cause);
    }
  });

  return (
    <div className="page-content-sre">
      <PageHeader
        title="Profil fiscal"
        description="Consultez les données rattachées à votre compte."
        breadcrumb={["Accueil", "Profil fiscal"]}
        actions={
          <Link className="button-sre button-sre--outline" to={ROUTES_CLIENT.passwordChange}>
            <KeyRound size={15} /> Modifier le mot de passe
          </Link>
        }
      />
      <div className="profile-grid-sre">
        <section className="card-sre">
          <div className="card-sre__header">
            <div>
              <h2>Identité fiscale</h2>
              <p>Données enregistrées par le service.</p>
            </div>
            <UserRound size={18} />
          </div>
          <dl className="details-list-sre">
            <div>
              <dt>Type de contribuable</dt>
              <dd>
                <StatusBadge status={taxpayer.type} />
              </dd>
            </div>
            <div>
              <dt>{taxpayer.type === "ENTREPRISE" ? "Raison sociale" : "Nom complet"}</dt>
              <dd>
                {taxpayer.type === "ENTREPRISE"
                  ? taxpayer.legalName
                  : `${taxpayer.firstName ?? ""} ${taxpayer.lastName}`}
              </dd>
            </div>
            {taxpayer.tradeName && (
              <div>
                <dt>Nom commercial</dt>
                <dd>{taxpayer.tradeName}</dd>
              </div>
            )}
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
            {taxpayer.legalRepresentative && (
              <div>
                <dt>Représentant légal</dt>
                <dd>{taxpayer.legalRepresentative}</dd>
              </div>
            )}
            <div>
              <dt>Compte créé le</dt>
              <dd>{formatDate(taxpayer.accountCreatedAt)}</dd>
            </div>
            {taxpayer.status && (
              <div>
                <dt>Statut du compte</dt>
                <dd>
                  <StatusBadge status={taxpayer.status} />
                </dd>
              </div>
            )}
          </dl>
          <div className="tax-note-sre">
            <span>i</span>
            <p>
              Le NIF, le STAT et les informations de connexion ne sont pas modifiables depuis cette
              page.
            </p>
          </div>
        </section>
        <section className="card-sre">
          <div className="card-sre__header">
            <div>
              <h2>Coordonnées</h2>
              <p>Modifications transmises au serveur.</p>
            </div>
          </div>
          <form className="form-sre compact-form-sre" onSubmit={save} noValidate>
            <ClientProfileFormFields
              form={form}
              error={form.error}
              isBusinessTaxpayer={taxpayer.type === "ENTREPRISE"}
              email={session?.email ?? taxpayer.email}
            />
            <SubmitButton inProgress={form.isSubmitting} pendingLabel="Enregistrement…">
              <Save size={15} /> Enregistrer les coordonnées
            </SubmitButton>
          </form>
        </section>
      </div>
      <section className="security-note-sre profile-note-sre">
        <ShieldCheck size={16} />
        <p>
          <strong>Protection des données</strong>
          <span>
            Le serveur limite l’accès à votre propre profil. Les contrôles de l’interface ne
            remplacent pas ceux du backend.
          </span>
        </p>
      </section>
    </div>
  );
}
