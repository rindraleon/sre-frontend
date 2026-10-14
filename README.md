# Interface web — Portail SRE

Interface React 18, TypeScript strict, Vite, Tailwind CSS, lucide-react et Manrope auto-hébergée. Les pages sont organisées par parcours dans `src/pages/`.

## Installation et lancement

```bash
npm ci
npm run dev
```

Vite lit les variables `VITE_*` dans le `.env` à la racine du projet (`envDir: ..`). Configurez `VITE_API_URL=http://localhost:3000` et autorisez l’origine de l’interface dans `CORS_ORIGINS` côté API. Sans URL d’API, l’interface ne propose aucune session locale et n’invente pas de données.

## Organisation du code

- `src/composants/ui/` : composants visuels et tableaux partagés.
- `src/contexte/` : état d’interface et session API.
- `src/pages/front-office/`, `authentification/`, `espace-client/`, `back-office/` : écrans par parcours.
- `src/services/api-sre.ts` : client HTTP, gestion des erreurs, délais et adaptateurs de contrats API.
- `src/types/sre.ts` : types métier frontend.

## Contrats et données

Les pages lisent ou écrivent les données métier par l’API. L’état initial est vide; aucun jeu d’exemple ou stockage métier de navigateur ne complète silencieusement une réponse serveur. La session conserve le jeton d’accès et les informations minimales nécessaires, pas les données métier.

Le parcours d’import Excel analyse et valide les lignes côté interface puis transmet les profils à `POST /contribuables/import`. Le modèle fourni ne contient que des en-têtes et l’API n’associe pas de compte ni de mot de passe aux profils importés. Les écrans de notifications, d’e-mails et de journal restent en état indisponible tant que l’API ne fournit pas ces services.

Les références de transaction saisies sont déclaratives. Aucun moyen de paiement n’est intégré et les documents PDF sont téléchargés depuis l’API; un accusé atteste uniquement la soumission et un reçu reste interne à une décision administrative explicite.

## Vérification

```bash
npm run typecheck
npm run build
```
