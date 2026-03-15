# SamaCV

SamaCV est un mini-projet web (HTML/CSS/JS) de **génération de CV** en 2 panneaux :
- à gauche, un **formulaire** (infos perso, éducation, expériences, compétences, intérêts)
- à droite, un **aperçu en direct** + un choix de **4 templates** + un bouton **Télécharger (PDF)**


---

## Architecture du projet

Architecture simple :
- Dossier Image
- Fichier html, css, js à la racine

### Structure

- `index.html`
	- Layout global + deux panneaux (formulaire / aperçu)
	- Toolbar à droite (sélecteur de modèle + bouton téléchargement)
	- Chargement des bibliothèques via CDN (notamment `jsPDF`) puis `script.js`

- `index.css`
	- Styles UI (containers, panels, boutons, responsive)
	- Styles de rendu du CV (classes `cv-*`)
	- Styles des templates basés sur `data-template` (classic/split/timeline/cards)

- `script.js`
	- Logique de l’application (lecture des champs, rendu DOM de l’aperçu, ajout dynamique d’entrées)
	- Export PDF direct via `jsPDF` (génération textuelle)
	- Persistance du modèle choisi via `localStorage`

- `assets/Images/`
	- Images du projet (ex: logo)

---

## Fonctionnement (flux principal)

1) Au chargement (`DOMContentLoaded`)
- Une entrée “Éducation” + une entrée “Expérience” sont ajoutées automatiquement.
- Le template est restauré depuis `localStorage` (clé `samacv.template`).
- L’aperçu est rendu une première fois.

2) Pendant la saisie
- Les événements `input` / `change` déclenchent un rendu avec un petit délai (anti-spam) via `scheduleRender()`.
- `renderPreview()` reconstruit le DOM dans `#cv-preview`.

3) Au téléchargement
- `downloadPdf()` relit les données du formulaire.
- Le PDF est généré via `jsPDF` avec pagination si nécessaire.
- Le fichier est sauvegardé côté navigateur (ex: `CV-Nom Prenom.pdf`).

---

## Choix techniques effectués

### 1) Javascript
- Projet éducatif : lecture facile, pas de tooling.
- Manipulation DOM directe (création d’éléments, rendu dans `#cv-preview`).

### 2) Templates via attribut `data-template`
- Le conteneur d’aperçu utilise `#cv-preview[data-template="..."]`.
- Chaque modèle change surtout :
	- l’accent (`--cv-accent`) et le fond soft (`--cv-soft`)
	- la mise en page (ex: `split` en 2 colonnes)
	- quelques variations (timeline, cards)


### 3) Persistance du template
- `localStorage` garde le dernier modèle choisi.
- UX meilleure : on retrouve son modèle après rechargement.

### 4) Export PDF via `jsPDF` (texte)
Le PDF est généré **directement** (sans impression) avec `jsPDF`.

Raison principale : la capture du DOM (type html2canvas/html2pdf) peut échouer ou produire un PDF blanc selon le navigateur, le contexte ou certains styles. La génération “texte” est plus fiable.

---

## Répartition des tâches (par modules)

Cette section décrit la répartition logique du travail (utile pour un rendu de projet, même si vous êtes seul).

1) Design, UI & UX -> Madieng
- Mise en page 2 panneaux, responsive
- Boutons, typographie, styles “simples et propres”
- Figma

2) Gestion du formulaire, Génération Cv, Template et téléchargement  -> Libasse

## Difficultés rencontrées

### 1) PDF blanc avec les librairies de capture DOM
Problème : selon Chrome / le contexte, certaines captures DOM donnent un PDF vide.


## Lancer le projet

- Ouvrir `index.html` dans un navigateur.
- Remplir le formulaire → l’aperçu se met à jour.
- Choisir un modèle → télécharger le PDF.

