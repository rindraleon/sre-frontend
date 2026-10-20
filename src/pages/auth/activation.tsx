import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { AuthHeader } from "@/components/layout/auth-header";
import { ActivationForm } from "@/components/forms/auth/activation-form";
import { callApi } from "@/services/api-client";

interface EtatActivation {
  enCours: boolean;
  valide: boolean | null;
  message: string;
  courrielMasque?: string;
  nom?: string;
  expireLe?: string;
}


export function ActivationPage() {
  const [rechercheParams] = useSearchParams();
  const jeton = rechercheParams.get("jeton") ?? "";
  const [etat, setEtat] = useState<EtatActivation>({
    enCours: true,
    valide: null,
    message: "Vérification du lien d’activation…",
  });

  useEffect(() => {
    let actif = true;
    const verifier = async () => {
      if (!jeton) {
        setEtat({
          enCours: false,
          valide: false,
          message: "Lien d’activation incomplet : aucun jeton fourni.",
        });
        return;
      }
      try {
        const information = await callApi<{
          valide: boolean;
          courrielMasque: string;
          nom: string;
          expireLe: string;
        }>(`auth/activation/${encodeURIComponent(jeton)}`);
        if (!actif) return;
        setEtat({
          enCours: false,
          valide: true,
          message: "Lien d’activation valide.",
          courrielMasque: information.courrielMasque,
          nom: information.nom,
          expireLe: information.expireLe,
        });
      } catch (cause) {
        if (!actif) return;
        setEtat({
          enCours: false,
          valide: false,
          message:
            cause instanceof Error
              ? cause.message
              : "Lien d’activation invalide, déjà utilisé ou expiré.",
        });
      }
    };
    void verifier();
    return () => {
      actif = false;
    };
  }, [jeton]);

  return (
    <div className="page-auth-sre">
      <AuthHeader surTitre="ACTIVATION DE VOTRE ESPACE" libelleLien="Connexion" cheminLien="/connexion" />
      <main className="auth-cadre-sre">
        <section className="auth-carte-sre">
          {etat.enCours && (
            <p className="text-center">Vérification du lien d’activation…</p>
          )}
          {!etat.enCours && etat.valide === false && (
            <>
              <h1 className="text-center">Lien d’activation non valide</h1>
              <p className="text-center" role="alert">
                {etat.message}
              </p>
              <p className="auth-lien-secondaire-sre text-center">
                Demandez un nouveau lien à votre administration, ou{" "}
                <Link to="/connexion">connectez-vous avec votre mot de passe provisoire</Link>.
              </p>
            </>
          )}
          {!etat.enCours && etat.valide === true && (
            <>
              <p className="text-center">
                <ShieldCheck size={16} aria-hidden="true" /> Bonjour {etat.nom || "…"} — compte{" "}
                {etat.courrielMasque}
              </p>
              <ActivationForm />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
