# Angular TODO List – Test Technique

Projet Angular 18 standalone avec Angular Material, TailwindCSS et mock API `json-server`.

## 📦 Installation et lancement

```bash
# à la racine du projet
cd todo-app
npm install
npm run mock:server   # API mock sur http://localhost:3000
npm start             # front sur http://localhost:4200
```

## ✅ Tests

- Voir chaque spec pendant l’exécution : `npm test -- --watch=false` (reporter “spec” activé).
- Couverture logique ajoutée :
  - `todo-list.component.spec.ts` : filtres multi-label + recherche titre/personne, pagination client, verrouillage/fin automatique des tâches terminées.
  - `person-list.component.spec.ts` : filtres nom/email combinés, pagination client.
  - `app.component.spec.ts` : configuration Transloco/router.

## 🎯 Fonctionnalités clés (conformément au PDF)

- Tâches : création/édition/suppression via modale, affectation à une personne, priorité, labels multiples, description.
- Marquer terminé verrouille la tâche et renseigne la date de fin automatiquement; actions désactivées si terminé.
- Filtrage/pagination : priorités, multi-label (ET logique), recherche mixte titre+personne, pagination client cohérente.
- Personnes : création/édition/suppression, unicité nom gérée côté dialog, recherche nom/email, pagination.
- Export : Excel & PDF des tâches visibles.
- i18n Transloco FR/EN (sélecteur de langue).
- UI : tableau custom Material (ng2-smart-table incompatible Angular 18), avatars initiales (2 chars), surlignage des correspondances de recherche.

## 🔗 Mock API (json-server)

- Ressources : `/todos`, `/persons` (fichier `mock/db.json` enrichi ~20 tâches, personnes supplémentaires).
- Paramètres supportés côté serveur : `_page`, `_limit`, `priority`, `labels_like`, `completed`, `title_like`, `name_like`, `email_like`.
- En front, filtrage avancé et pagination sont gérés côté client après récupération complète quand nécessaire (labels multiples, recherche combinée).

## 🛠️ Stack

- Angular 18 (standalone) + Angular Material + TailwindCSS
- json-server pour les données simulées
- Transloco pour l’i18n
- Export : `xlsx`, `file-saver`, `jspdf`, `jspdf-autotable`
- Tests : Karma/Jasmine avec reporter “spec”

## Scripts utiles

- `npm start` : front dev `http://localhost:4200`
- `npm run mock:server` : API mock `http://localhost:3000`
- `npm run build` : build de prod
- `npm test -- --watch=false` : exécution des tests unitaires (affichage des specs)

## Notes

- Builder Angular : webpack (`@angular-devkit/build-angular:browser`) pour éviter les soucis esbuild.
- ng2-smart-table : remplacé par un tableau Material custom (ng2-smart-table incompatible Angular 18/Ivy).

## 🐳 Docker / déploiement Nginx

Build et image :

```bash
docker build -t todo-app .
docker run -p 8080:80 todo-app
```

L’image utilise un multi-stage (Node 20 pour le build, Nginx pour le statique) et un `nginx.conf` déjà configuré pour une SPA (`try_files ... /index.html`). Les fichiers générés sont servis depuis `/usr/share/nginx/html`.

Sur un serveur avec un Nginx frontal (SSL, vhost), placez le contenu de `dist/todo-app` ou montez le conteneur derrière votre reverse-proxy. Votre vhost peut suivre ce schéma :

```
server {
    server_name test.oplatforms.com;
    root /var/www/test;  # ou proxy_pass vers le conteneur
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```
