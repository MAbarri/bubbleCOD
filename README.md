# Manteau Alma — page produit

Page produit statique de Manteau Alma. Le site compilé et ses images sont dans `dist/`.

## Déploiement avec Cloudflare Pages

Le projet utilise la branche `Manteau-Alma`, sans commande de build, avec `dist` comme répertoire de sortie. La fonction Pages dans `functions/api/order.js` reçoit les commandes et les transmet à Google Apps Script.

## Relier les commandes à Google Sheets

1. Dans Google Drive, crée un projet Apps Script et colle le contenu de `google-apps-script/Code.gs`.
2. Dans Apps Script, exécute `setupOrdersSheet` une fois et accepte les autorisations Google demandées. Le journal d’exécution affiche le lien du tableau créé et la valeur `ORDER_SHARED_SECRET`. Garde cette valeur privée.
3. Dans **Déployer → Nouveau déploiement**, choisis **Application Web**, exécuter en tant que **toi**, puis autorise l’accès à **Tout le monde**. Copie l’URL se terminant par `/exec`.
4. Dans Cloudflare Pages → **Settings → Variables and Secrets**, ajoute pour l’environnement **Preview** (et **Production** si tu l’utilises) :
   - `GOOGLE_SCRIPT_URL` : l’URL `/exec` de l’application Web ;
   - `ORDER_SHARED_SECRET` : la valeur affichée par `setupOrdersSheet`.
5. Relance le déploiement Pages après avoir ajouté les variables.

Le secret reste côté serveur : le navigateur envoie la commande à `/api/order`, et la fonction Cloudflare ajoute le secret avant de transmettre les données. Chaque commande est ajoutée dans l’onglet **Commandes** avec un statut **À confirmer**. Si tu modifies ensuite le script Apps Script, crée une nouvelle version du déploiement Web App.
