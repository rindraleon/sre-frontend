import { useEffect } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/contexts";
import { useSre } from "@/contexts";
import {
  CARD_CLASS,
  CARD_HEADER_CLASS,
  COMPACT_FORM_CLASS,
  DETAILS_LIST_CLASS,
  DETAIL_GRID_CLASS,
  EmptyState,
  FORM_CLASS,
  PAGE_CONTENT_CLASS,
  PROFILE_NOTE_CLASS,
  PageHeader,
  SECURITY_NOTE_CLASS,
  StatusBadge,
  SubmitButton,
  TAX_NOTE_CLASS,
  buttonVariants,
} from "@/components";
import { formatDate, cn } from "@/utils";
import { MSG_RECORD_FAILURE, MSG_SESSION_MISSING, ROUTES_CLIENT } from "@/data";
import { useApiForm } from "@/hooks";
import { ClientProfileFormFields, CONTACT_DETAILS_EMPTY } from "@/components/TaxpayersComponents";
import { clientProfileSchema, type ClientProfileFormValues } from "@/schemas";
import { updateMyTaxpayerProfileApi } from "@/services/taxpayers";

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
      nif: taxpayer.nif ?? "",
      adresse: taxpayer.address,
      ville: taxpayer.city,
      telephone: taxpayer.phone,
      nomCommercial: taxpayer.tradeName ?? "",
    });
  }, [taxpayer?.id]);

  if (!taxpayer)
    return (
      <div className={PAGE_CONTENT_CLASS}>
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
      const updatedProfile = await updateMyTaxpayerProfileApi(session.apiToken, {
        nif: values.nif.trim(),
        adresse: values.adresse.trim(),
        ville: values.ville.trim(),
        telephone: values.telephone.trim(),
        ...(taxpayer.type === "ENTREPRISE" ? { nomCommercial: values.nomCommercial.trim() } : {}),
      });
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
    <div className={PAGE_CONTENT_CLASS}>
      <PageHeader
        title="Profil fiscal"
        description="Consultez les données rattachées à votre compte."
        breadcrumb={["Accueil", "Profil fiscal"]}
        actions={
          <Link
            className={buttonVariants({ variant: "outline" })}
            to={ROUTES_CLIENT.passwordChange}
          >
            <KeyRound size={15} /> Modifier le mot de passe
          </Link>
        }
      />
      <div className={DETAIL_GRID_CLASS}>
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Identité fiscale</h2>
              <p>Données enregistrées par le service.</p>
            </div>
            <UserRound size={18} />
          </div>
          <dl className={DETAILS_LIST_CLASS}>
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
          <div className={TAX_NOTE_CLASS}>
            <span>i</span>
            <p>
              Le NIF est obligatoire pour effectuer une déclaration. Vous pouvez le renseigner ou le
              corriger dans le formulaire de coordonnées.
            </p>
          </div>
        </section>
        <section className={CARD_CLASS}>
          <div className={CARD_HEADER_CLASS}>
            <div>
              <h2>Coordonnées</h2>
              <p>Modifications transmises au serveur.</p>
            </div>
          </div>
          <form className={cn(COMPACT_FORM_CLASS, FORM_CLASS)} onSubmit={save} noValidate>
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
      <section className={cn(SECURITY_NOTE_CLASS, PROFILE_NOTE_CLASS)}>
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
