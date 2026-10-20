# Interface web – Portail SRE

Interface web React 18 + TypeScript + Vite + Tailwind CSS pour le Portail SRE.

## 1. Prérequis

| Outil | Version recommandée | Remarques |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | >= 18.x (LTS) | Recommandé Node.js 20.x |
| [npm](https://www.npmjs.com/) | >= 9.x | Livré avec Node.js |
| [API SRE](../serveur-api) | En fonctionnement | L'interface nécessite l'API sur `http://localhost:3000` |

## 2. Clonage et installation

#bash
git clone <url-du-depot>.git
cd paiement/interface-web


### 2.1. Installer les dépendances

#bash
npm install  #local
npm ci  #production

### 2.2. Configuration de l'environnement

L'interface lit les variables `VITE_*` depuis un fichier `.env` placé **dans le dossier parent** du frontend (`envDir: ".."` dans `vite.config.ts`).

Créer le fichier `.env` à la racine du dépôt `paiement/` :

#bash
# Depuis paiement/
echo VITE_API_URL=http://localhost:3000 > .env


Ou manuellement :

env
VITE_API_URL=http://localhost:3000


> Assurez-vous que l'API autorise bien l'origine `http://localhost:5173` dans `CORS_ORIGINS`.

## 3. Lancement

#bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview


L'interface sera accessible sur : [http://localhost:5173](http://localhost:5173)

## 4. Commandes utiles

| Commande | Description |
| --- | --- |
| `npm ci` | Installer les dépendances |
| `npm run dev` | Lancer le serveur de développement Vite |
| `npm run build` | Générer le build de production |
| `npm run preview` | Prévisualiser le build localement |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Lancer les tests Vitest |

## 5. Structure du projet

text
interface-web/
├── public/           # Fichiers statiques servis tels quels
└── src/
    ├── App.tsx       # Routage racine
    ├── main.tsx      # Point d'entrée
    ├── assets/       # Images, icônes, polices
    ├── components/   # Composants UI, layout, formulaires
    ├── context/      # Contextes React (auth, thème)
    ├── pages/        # Pages par parcours (public, auth, client, admin)
    ├── services/     # Client API et mappers
    ├── types/        # Types TypeScript
    ├── utils/        # Fonctions utilitaires
    ├── validation/   # Schémas de validation Zod
    └── styles/       # Feuilles de style CSS


## 6. Auteur

**Rindra & Harena**