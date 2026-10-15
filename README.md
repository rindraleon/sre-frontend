# Interface web — Portail SRE

Interface React 18, TypeScript strict, Vite, Tailwind CSS, lucide-react et Manrope auto-hébergée. Les pages sont organisées par parcours dans `src/pages/`.

## Installation et lancement

```bash
npm ci
npm run dev
```

Vite lit les variables `VITE_*` dans le fichier `.env` situé **dans le dossier parent du dépôt frontend** (`envDir: ".."` dans `vite.config.ts`) — pas à la racine de `sre-frontend`. Configurez `VITE_API_URL=http://localhost:3000` et autorisez l’origine de l’interface dans `CORS_ORIGINS` côté API. Sans URL d’API, l’interface ne propose aucune session locale et n’invente pas de données.

## Organisation du code

- `src/composants/ui/` : composants visuels partagés — `layout-sre.tsx` (layout des espaces authentifiés, composition), `barre-laterale-sre.tsx` (sidebar/tiroir mobile), `barre-superieure-sre.tsx` (navbar + menu utilisateur), `layout-public-sre.tsx` (en-tête auth partagé), `composants-sre.tsx` (boutons, badges, tableaux, modales, toasts), `champ-formulaire.tsx` (champs RHF), `core-spin-loader.tsx` (CoreSpin + PageLoader), `select-recherchable.tsx` (select avec recherche locale).
- `src/contexte/` : état d’interface, session API et **thème** (`contexte-theme-sre.tsx` : clair/sombre, persistance `localStorage` `sre-theme`, respect de `prefers-color-scheme`, application sans clignotement via script dans `index.html`).
- `src/pages/front-office/`, `authentification/`, `espace-client/`, `back-office/` : écrans par parcours.
- `src/services/api-sre.ts` : client HTTP, gestion des erreurs, délais et adaptateurs de contrats API.
- `src/types/sre.ts` : types métier frontend.
- `src/validation/` : schémas Zod par domaine (`authentification`, `profil`, `paiement`, `administration`), alignés champ par champ sur les DTO backend, messages d’erreur en français, et helper `erreurs-api.ts` qui projette les erreurs API par champ sur les formulaires (`setError()`).
- `src/composants/ui/champ-formulaire.tsx` : champs partagés React Hook Form (`ChampFormulaireSre`, `ChampMotDePasseSre` avec affichage/masquage, `BoutonSoumissionSre` avec spinner et anti-double-soumission, `ErreurFormulaireSre`).

## Contrats et données

Les pages lisent ou écrivent les données métier par l’API. L’état initial est vide; aucun jeu d’exemple ou stockage métier de navigateur ne complète silencieusement une réponse serveur. La session conserve le jeton d’accès et les informations minimales nécessaires, pas les données métier.

Le parcours d’import Excel analyse et valide les lignes côté interface puis transmet les profils à `POST /contribuables/import`. Le modèle fourni ne contient que des en-têtes et l’API n’associe pas de compte ni de mot de passe aux profils importés. Les écrans de notifications, d’e-mails et de journal restent en état indisponible tant que l’API ne fournit pas ces services.

Les références de transaction saisies sont déclaratives. Aucun moyen de paiement n’est intégré et les documents PDF sont téléchargés depuis l’API; un accusé atteste uniquement la soumission et un reçu reste interne à une décision administrative explicite.

## Vérification

```bash
npm run typecheck
npm run build
npm test        # tests unitaires Vitest des schémas de validation
```

## Conventions formulaires et notifications

- Formulaires : React Hook Form (`mode: "onTouched"`) + Zod via `@hookform/resolvers`. Validation progressive par champ, erreur affichée sous le champ (`aria-invalid`/`aria-describedby`, focus sur le premier champ invalide), bouton désactivé avec spinner pendant l’envoi. Les erreurs `400` de l’API au format `{ errors: { champ: [messages] } }` sont appliquées aux champs concernés ; les autres restent en erreur globale du formulaire.
- Règle mot de passe (source de vérité = DTO backend) : **10 caractères minimum, une majuscule, une minuscule et un chiffre**, à l’inscription comme au changement de mot de passe.
- Toasts : système interne (`notifier()` dans `contexte-sre.tsx`), affichés en bas à droite (pleine largeur en bas sur mobile), fermables au clavier/souris, dédupliqués, `role="alert"` pour les erreurs. Aucun toast de succès n’est affiché avant la réponse réelle de l’API.
- Accessibilité : modales fermables par `Échap` avec piégeage et restitution du focus ; hauteurs en `100dvh` ; champs à 16 px sur mobile (anti-zoom iOS) ; respect de `prefers-reduced-motion`.

## Interface (refonte)

- **Thème sombre** : bascule depuis le menu utilisateur (avatar) de la barre supérieure, sans rechargement, conservé après actualisation. Couleurs portées par les variables `--sre-*` et des surcharges `[data-theme="sombre"]` dans `index.css` ; le document PDF (accusé/reçu) reste volontairement clair pour l’impression.
- **Menu utilisateur** : avatar avec initiales de secours, nom et e-mail réels de session, Mon profil (contribuable — aucune route profil admin n’existe), Paramètres, Thème clair/sombre, Déconnexion immédiate (toast affiché après la fermeture effective de session). Fermeture Échap/clic extérieur, navigation clavier.
- **Loaders** : `CoreSpinLoaderSre` (spinner accessible `role="status"`) et `PageLoaderSre` pour l’initialisation de session ; `BoutonSre chargement` et `BoutonSoumissionSre` pour les actions asynchrones (désactivés, anti-double-soumission).
- **Select avec recherche** : `SelectRecherchableSre` (filtrage local insensible aux accents — l’API ne propose pas de recherche distante — clavier, effacement, états vide/chargement/erreur) ; utilisé pour le choix du contribuable dans la création d’obligation.
- **Landing** : animations CSS discrètes (apparition du hero, survol des cartes), neutralisées par `prefers-reduced-motion`.
- **Typographie** : Manrope variable locale (`@fontsource-variable/manrope`), token `--sre-police`, aucune police externe.

## Notifications (centre client et administration)

Les notifications proviennent désormais de l'API (`GET /notifications`, marquage lu par `PATCH`) : compteurs réels dans la sidebar/navbar, page client avec « Tout marquer comme lu », statut d'envoi du courriel affiché distinctement (envoyé / échec / non envoyé) sans jamais présenter un échec comme un envoi. Les rappels d'échéances sont générés par le job backend documenté dans le README de `sre-backend`.

## Structure du code (anglais)

- `src/App.tsx` : routage racine ; `src/main.tsx` : point d'entrée.
- `src/assets/{images,icons,fonts}/` : assets importés par le code (voir `src/assets/README.md`) ; `public/` = fichiers servis tels quels (modèle Excel).
- `src/components/ui/` : composants réutilisables un par fichier (`Button`, `Modal`, `DataTable`, `SearchableSelect`, `CoreSpinLoader`…) + barrel `index.ts`.
- `src/components/layout/` : `AppLayout`, `Sidebar`, `Topbar`, `AuthHeader` ; `src/components/forms/` : `FormField` ; `src/components/auth/` : `RegisterForm`.
- `src/context/` : `AuthContext`, `SreContext`, `ThemeContext` (hooks `useAuth`, `useSre`, `useTheme`).
- `src/pages/{public,auth,client,admin}/` : une page par fichier (détails séparés : `PaymentDetail`, `TaxpayerDetail`…).
- `src/services/` : `api.ts` (appels/chargement) et `apiMappers.ts` ( conversions API → modèles).
- `src/types/models.ts`, `src/utils/{constants,format}.ts`, `src/validation/*.schema.ts`.
- `src/styles/` : CSS découpé par domaine (`base`, `layout`, `components`, `forms`, `pages`, `public`, `auth`, `admin`, `documents`, `dark-theme`…), importé dans l'ordre par `src/index.css`.

Convention : dossiers, fichiers, fonctions, composants et types **exportés** en anglais ; les libellés affichés, les champs d'API, les URL et les clés de stockage restent inchangés (contrats).
