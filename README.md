# Manteau Sélène — page produit

Page produit statique du Manteau Sélène — Gris Anthracite. Le site et ses images sont dans `dist/`. Cloudflare Pages sert directement le dossier `dist`; aucune compilation ni fonction serveur n’est nécessaire.

## Relier les commandes à Google Sheets

La page envoie les commandes directement à un Google Form. Les réponses du formulaire s’enregistrent dans la feuille Google Sheets qui lui est liée.

1. Crée un Google Form avec des questions courtes pour : nom complet, téléphone, ville, adresse, produit, couleur, taille, quantité, prix unitaire et total.
2. Dans l’onglet **Réponses** du formulaire, crée ou sélectionne la feuille Google Sheets de destination.
3. Dans Google Forms, utilise **Obtenir un lien prérempli**, saisis des valeurs de test et génère le lien. Dans son URL, chaque paramètre `entry.123456` donne l’identifiant correspondant à une question.
4. Dans `dist/index.html`, remplace `GOOGLE_FORM_RESPONSE_URL` par l’URL du formulaire terminée par `/formResponse`. Remplis `GOOGLE_FORM_ENTRY_IDS` avec l’identifiant de chaque champ (uniquement la partie numérique, sans `entry.`).
5. Pousse le changement sur la branche `Manteau-Selene`. Cloudflare Pages déploiera la version mise à jour.

Les champs du formulaire Google doivent accepter les réponses de toute personne disposant du lien. Le navigateur envoie les données directement à Google Forms ; il n’y a ni Apps Script, ni fonction Cloudflare, ni secret à configurer. La réponse du formulaire étant cross-origin, la page ne peut pas lire une confirmation détaillée de Google.
