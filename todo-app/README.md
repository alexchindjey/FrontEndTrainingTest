# Angular TODO List

Projet Angular 18 standalone avec Angular Material, TailwindCSS et un mock API `json-server`.

## Démarrer en local

```bash
# depuis le dossier todo-app
npm install
npm run mock:server   # API mock sur http://localhost:3000
npm start             # front sur http://localhost:4200
```

## Périmètre mock

- Ressources exposées : `/todos` et `/persons`
- Pagination/filtre supportés côté mock : `_page`, `_limit`, `priority`, `labels_like`, `name_like`
- L’API renvoie `X-Total-Count` pour faciliter la pagination.

## Stack

- Angular 18 standalone
- Angular Material (thème azur/bleu)
- TailwindCSS utility-first
- json-server pour les données simulées
- Tableau personnalisé Material (fallback car `ng2-smart-table` n’est plus compatible Angular 18)

## Scripts utiles

- `npm start` : démarre le front en mode dev
- `npm run mock:server` : démarre json-server sur `http://localhost:3000`
- `npm run build` : build de prod (voir note sur esbuild si besoin)

## Note build/esbuild

Sur certaines machines, le build Angular peut échouer avec un deadlock esbuild. Le projet est basculé sur le builder webpack (`@angular-devkit/build-angular:browser`) pour éviter ce souci. En cas de problème persistant, réinstaller `node_modules` ou tester une version LTS différente de Node.

## Note tableau

Le composant `ng2-smart-table` d’origine n’est plus compatible avec Angular 18 (Ivy). Un composant de tableau personnalisé basé sur Angular Material a été ajouté avec le même usage (colonnes configurables, actions personnalisées) pour respecter l’affichage attendu.
