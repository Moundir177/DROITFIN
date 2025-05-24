# Fondation Pour la Promotion des Droits

Ce projet est un site web multilingue (français et arabe) pour une fondation de promotion des droits humains.

## Fonctionnalités

- Site web multilingue (français et arabe)
- Conception responsive avec Tailwind CSS
- Pages dynamiques avec Next.js
- Interface d'administration pour la gestion du contenu

## Interface d'administration

Une interface d'administration complète a été implémentée pour permettre la gestion du contenu du site web. Cette interface comprend :

### Authentification

- Page de connexion sécurisée
- Identifiants par défaut : 
  - Nom d'utilisateur : `admin`
  - Mot de passe : `admin123`

### Tableau de bord

- Vue d'ensemble des statistiques du site
- Accès rapide aux différentes sections d'administration

### Gestion des pages

L'interface permet de modifier le contenu de toutes les pages principales du site :
- Page d'accueil
- À propos
- Programmes
- Actualités
- Ressources
- Galerie
- Contact

Pour chaque page, il est possible de :
- Modifier les titres et textes en français et en arabe
- Ajouter, modifier ou supprimer des sections
- Réorganiser l'ordre des sections
- Télécharger et gérer les images
- Synchroniser le contenu avec la version publique du site

### Gestion des actualités

- Ajout, modification et suppression d'articles d'actualité
- Gestion des catégories d'actualités
- Édition multilingue (français et arabe)

### Gestion des ressources

- Ajout, modification et suppression de ressources documentaires
- Gestion des types de ressources (rapports, guides, analyses, etc.)
- Téléchargement de fichiers PDF et d'images

### Galerie d'images

- Téléchargement et organisation des images
- Ajout de descriptions multilingues
- Gestion des catégories d'images

## Stockage des données

Pour cette démonstration, les données sont stockées côté client dans le localStorage du navigateur. Dans un environnement de production, il faudrait implémenter :

- Une base de données sécurisée
- Des API pour la gestion des données
- Un système d'authentification robuste

## Installation et démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Démarrer en mode production
npm start
```

## Accès à l'interface d'administration

Après avoir démarré le serveur, accédez à l'interface d'administration via :

```
http://localhost:3000/admin
```

Utilisez les identifiants par défaut mentionnés ci-dessus pour vous connecter.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
