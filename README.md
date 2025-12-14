# Angular TODO List – Test Technique

Ce projet est un test technique Angular dont l’objectif est de démontrer la conception et l’implémentation d’une application de type TODO List simple, propre et maintenable.

L’application permet de gérer :
- des tâches (Todo)
- des personnes (Person)

Toutes les données sont simulées à l’aide de `json-server`. Aucune véritable API backend n’est implémentée, conformément aux consignes du test.

---

## 🎯 Objectifs du projet

L’objectif principal de ce projet est de démontrer :
- Une bonne compréhension des fondamentaux d’Angular
- Une structure de projet et une organisation du code appropriées
- Le respect des règles métier et des contraintes de validation
- Un code TypeScript clair, lisible et maintenable
- Un processus de développement professionnel avec des commits Git explicites et pertinents

---

## 🧩 Périmètre fonctionnel

### Tâches (Todo)
- Création, modification et suppression de tâches
- Affectation d’une tâche à une personne
- Gestion de la priorité et de plusieurs labels
- Gestion automatique de l’état de complétion et de la date de fin
- Filtrage par priorité et par labels
- Pagination de la liste des tâches

### Personnes
- Création, modification et suppression de personnes
- Validation de l’unicité des noms et de la validité des adresses email
- Filtrage et pagination

---

## 📋 Règles métier implémentées

- Le titre d’une tâche et le nom d’une personne doivent contenir au moins 3 caractères (après suppression des espaces inutiles)
- L’adresse email d’une personne doit être valide
- Les noms des personnes doivent être uniques
- Une tâche peut contenir plusieurs labels
- Lorsqu’une tâche est marquée comme terminée, la date de fin est automatiquement définie et devient non modifiable
- Les formulaires ne peuvent pas être soumis s’il existe des erreurs de validation

---

## 🛠️ Stack technique

- Angular (standalone)
- TypeScript
- Angular Material + Tailwind CSS
- json-server (mock API)
- Tableau custom Material (remplace ng2-smart-table, incompatible Angular 18)

---

## 🧪 API simulée (Mock)

L’application utilise `json-server` pour simuler les appels API.
Les données sont stockées localement dans un fichier JSON et sont accessibles via `HttpClient` d’Angular.

---

## 🚀 Approche de développement

- Un commit Git par étape logique
- Messages de commit clairs et explicites
- Implémentation progressive en respectant les exigences du test
- Priorité donnée à la lisibilité et à la maintenabilité du code plutôt qu’à la complexité visuelle

---

## 📦 Fonctionnalités bonus (si implémentées)

- Internationalisation (i18n) avec Transloco
- Export des tâches au format Excel et PDF

---

## ▶️ Lancement du projet

Les instructions pour lancer le projet en local ou via Docker sont disponibles dans ce dépôt.
# FrontEndTrainingTest
