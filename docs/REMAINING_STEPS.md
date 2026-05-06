# Étapes restantes — Implémentation des nouvelles unités/structures

Date : 6 mai 2026
Auteur : Résumé automatique

But : lister en détail les étapes restantes pour terminer l'ajout des 20 objets/units planifiés (Phases 1–4), rendre jouable et testable, et finaliser l'intégration client/serveur.

---

## Rappel de l'état actuel (contexte rapide)

- Phase 1 (structures défensives + économie) : types, configs, spawn logic, 5 Execution classes (Bunker, TurretAntiInf, TurretAntiNaval, MineExtractor, StratPort), BuildMenu et traductions EN ont été ajoutés et testés.
- Compilation TypeScript propre et tests Phase 1 passés (7/7).

---

## Objectif global restant

Finaliser Phases 2–4, écrire les Executions manquantes, étendre IA/vision/attaques, ajouter UI/icônes/traductions, couvrir par tests unitaires & d'intégration, effectuer playtests et équilibrage, préparer doc & release.

---

## Plan détaillé des étapes restantes

Chaque étape indique : actions, fichiers cibles (exemples), dépendances, tests associés, estimation (heuristique).

### Phase 2 — Unités terrestres / logiques basiques (Tank, Artillery, AttackDrone)

1. Implémenter les classes d'Execution : `TankExecution`, `ArtilleryExecution`, `AttackDroneExecution`.
   - Fichiers cibles : `src/core/execution/*.ts`
   - Comportement attendu : mouvement/attaque déterministe (réutiliser patterns `WarshipExecution` / `AttackExecution`).
   - Tests : un test unitaire par classe vérifiant spawn, cible et diminution de health d'une cible.
   - Estimation : 6–10h.
2. Ajuster `ConstructionExecution` / imports si nécessaire.
3. Ajouter cas dans `unitInfo()` si besoin d'ajustement de stats.

### Phase 3 — Unités navales & détection (Submarine, Destroyer, CarrierShip, Radar)

1. `SubmarineExecution` : logique de plongée / furtivité (n'affiche pas dans nearbyUnits sauf si détecté).
   - Dépendance : conception du système de visibilite (voir Radar ci-dessous).
2. `DestroyerExecution`, `CarrierShipExecution` : patrouille, attaque navale (réutiliser WarshipExecution).
3. `RadarExecution` : balaye et révèle unités furtives dans un rayon, déclenche événements de découverte.
   - Fichiers cibles : `src/core/execution/*`, `src/core/game/*` (API de vision), tests.
   - Estimation : 12–20h (radar + sub stealth correctes = plus lourd).
4. Tests : scénarios d'interaction sub ↔ radar → révélation.

### Phase 4 — Armes avancées et interactions complexes (EMPLauncher, CruiseMissile, OrbitalLaser, MIRV variants)

1. `EMPLauncherExecution` : affecte unités électroniques (débuffs, désactivation) — définir quels types affectés.
2. `CruiseMissileExecution` / `OrbitalLaserExecution` : trajectoire, ciblage, dégâts d'area; respecter règles de non-ciblage d'alliés / game-mode Team.
3. `FragBomb` / `ImpulseBomb` : petits munitions tactiques — aire d'effet et effets secondaire (stun, push, etc.).
4. Tests : validations de portée, d'impact, d'effets secondaires et des protections (SAM, shields).
5. Estimation : 16–30h (complexité élevée, tests critiques).

### IA & comportement (réutilise nouvelles unités)

1. Mettre à jour comportements des bots : priorités de production (p.ex. construire turrets vs tanks), réponse aux nouvelles menaces (EMP, submersibles).
2. Fichiers cibles : `src/core/ai/` ou `src/core/game/*` (où l'AI est définie — ex: TribeExecution, AiAttackBehavior).
3. Tests : tests d'intégration nation/IA pour vérifier qu'ils construisent/réagissent.
4. Estimation : 6–12h.

### Vision / réseau / Schema

1. Vérifier si l'état des nouvelles unités (cloaked/submerged, radar-detected, emp-disabled) doit être ajouté aux messages (Schemas.ts).
   - Si oui : mettre à jour `src/core/Schemas.ts` et tests de sérialisation.
2. S'assurer que `GameView`/GameUpdate envoie correctement les flags (révélation, disabled) au client sans casser la déterminisme.
3. Estimation : 3–6h.

### Tests unitaires & d'intégration

1. Pour chaque Execution : écrire tests unitaires couvrant : création, tick progression, effets attendus, suppression.
2. Suite d'intégration : scénarios multi-player / multi-unit interactions
3. Exécution automatisée via `npm test`; ajouter tests ciblés (Vitest).
4. Estimation : 10–20h (selon nombre d'units et scénarios).

### UI / client

1. BuildMenu : icônes définitives, tooltips, descriptions (utiliser `resources/lang/en.json` entries existantes), catégoriser correctement.
2. Sprites/icônes : ajouter assets dans `resources/icons` ou `proprietary/` si nécessaire.
3. Mini-map / overlays : montrer détection radar / état EMP (humeur visuelle).
4. Tests UI (si existants) et vérification manuelle.
5. Estimation : 6–12h.

### Traductions

1. Compléter `resources/lang/en.json` pour tous les nouveaux `unit_type` et `build_menu.desc` champs.
2. Pousser vers Crowdin / pipeline de traduction si configuré.
3. Estimation : 1–3h.

### Playtests & équilibrage

1. Organiser sessions de playtest solo et privées pour mesurer coût/puissance/usage.
2. Collecter métriques (si possible) : taux de construction, taux de destruction, temps moyen de survie, gold généré.
3. Affiner `unitInfo()` (cost, health, build time, weaponDamage) et itérer.
4. Estimation : variable (8–24h selon retours).

### Performance & Profiling

1. Profiler ticks lourds (PlayerExecution, Port/StratPort, many trade spawns).
2. Optimiser boucles : réduire traversées O(n^2), limiter fréquence de checks (déjà fait sur Port/DefensePost), batcher exécutions si utile.
3. Tests de charge : jeu solo avec 8+ bots, mesures CPU/ticks.
4. Estimation : 6–12h.

### Documentation & release

1. Mettre à jour `docs/` (Architecture, Release notes) : nouvelles unités, mécaniques (radar, EMP, submerge).
2. Mettre à jour `resources/changelog.md` et `resources/version.txt`.
3. Préparer notes de migration si modifications de schema.
4. Estimation : 2–4h.

---

## Checklist / Priorités (ordre recommandé)

1. Implémenter Executions Phase 2 (Ground units) + tests (bloquant pour IA & combat).
2. Implémenter Executions Phase 3 (Naval + Radar) et tests (fortement dépendant pour submarine stealth).
3. Armes avancées (EMP/Cruise/Orbital) + tests.
4. Mettre à jour IA pour utiliser nouvelles unités.
5. Tests d'intégration et playtests (iterate).
6. UI/icônes/trad et synchronisation.
7. Perf profiling & doc release.

---

## Conseils techniques et points d'attention

- Respecter la contrainte : logique de `src/core/` doit rester déterministe (pas de Math.random non-seedé). Utiliser `PseudoRandom` et les patterns existants.
- Toujours ajouter tests pour chaque nouvelle Execution avant d'ajouter logique complexe.
- Les modifications qui changent l'API réseau doivent être limitées et rétro-compatibles ; ajouter flags optionnels plutôt que renommer champs.
- Pour la furtivité/submersion, modéliser le flag d'état sur l'`Unit` (p.ex. `isSubmerged()` / `isCloaked()`) et centraliser la logique de visibilité (méthode `isVisibleTo(player)` dans `Game`).

---

## Estimation globale (ordre de grandeur)

- Phase 2 : 6–10h
- Phase 3 : 12–20h
- Phase 4 : 16–30h
- IA, Tests, UI, Traductions, Perf, Docs : 30–60h

Total estimé : 70–130h (dépend fortement des détails et du raffinement des mécaniques)

---

## Prochaine action recommandée immédiate (concrète)

1. Choisir la priorité suivante : Phase 2 (Tank/Artillery/AttackDrone).
2. Je peux créer les templates d'Execution pour ces 3 unités (fichiers + import dans `ConstructionExecution.ts`) et des tests unitaires de base — voulez-vous que je commence maintenant ?

---

Fichier généré automatiquement. Merci de me dire si vous voulez que je commence l'étape immédiate (ex : créer les Execution Phase 2) et je lance les modifications et tests.
