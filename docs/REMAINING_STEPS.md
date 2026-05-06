# Étapes restantes — Implémentation des nouvelles unités/structures

Date de création : 6 mai 2026 · Dernière mise à jour : 6 mai 2026
Auteur : Résumé automatique

But : lister en détail les étapes restantes pour terminer l'ajout des 20 objets/units planifiés (Phases 1–4), rendre jouable et testable, et finaliser l'intégration client/serveur.

---

## État actuel (mis à jour)

| Phase | Statut | Tests |
|-------|--------|-------|
| Phase 1 — Structures défensives & économie (Bunker, TurretAntiInf, TurretAntiNaval, MineExtractor, StratPort) | ✅ Terminée | 7/7 ✅ |
| Phase 2 — Unités terrestres & aériennes (Tank, Artillery, AttackDrone) | ✅ Terminée | 12/12 ✅ |
| Phase 3 — Unités navales & détection (Submarine, Destroyer, CarrierShip, Radar) | ✅ Terminée | 17/17 ✅ |
| Phase 4 — Armes avancées (EMPLauncher, CruiseMissile, OrbitalLaser, FragBomb, ImpulseBomb) | ✅ Terminée | 9/9 ✅ |

**Total tests : 1083/1083 ✅** — compilation TypeScript propre.

---

## Objectif global restant

Les quatre phases de simulation (logique de jeu) sont complètes. Les efforts restants concernent l'IA, l'interface visuelle, les traductions, l'équilibrage, les performances et la documentation.

---

## Plan détaillé des étapes restantes

### ~~Phase 2 — Unités terrestres / logiques basiques (Tank, Artillery, AttackDrone)~~ ✅ TERMINÉE

- ~~Implémenter `TankExecution`, `ArtilleryExecution`, `AttackDroneExecution`.~~
- ~~Ajuster `ConstructionExecution` / imports.~~
- ~~Ajouter stats dans `unitInfo()`.~~
- ~~Tests (12 tests passés).~~

### ~~Phase 3 — Unités navales & détection (Submarine, Destroyer, CarrierShip, Radar)~~ ✅ TERMINÉE

- ~~`SubmarineExecution` avec logique de furtivité (`isVisibleTo`).~~
- ~~`DestroyerExecution` (priorité sous-marins), `CarrierShipExecution` (lance des drones).~~
- ~~`RadarExecution` : scan périodique, révèle sous-marins ennemis.~~
- ~~Ajout de `radarScanInterval()` et `radarDetectionRange()` dans la config.~~
- ~~Tests (17 tests passés).~~

### ~~Phase 4 — Armes avancées (EMPLauncher, CruiseMissile, OrbitalLaser, FragBomb, ImpulseBomb)~~ ✅ TERMINÉE

- ~~`EMPLauncherExecution` : structure, tirs EMP périodiques sur unités électroniques ennemies.~~
- ~~`CruiseMissileExecution` : dégâts de zone avec décroissance linéaire.~~
- ~~`OrbitalLaserExecution` : frappe instantanée, décroissance quadratique, dégâts maximaux.~~
- ~~`FragBombExecution` : bombe à fragmentation, large rayon, décroissance linéaire.~~
- ~~`ImpulseBombExecution` : dégâts cinétiques + bonus sur unités électroniques.~~
- ~~Valeurs de dégâts et de santé ajoutées dans la config.~~
- ~~Tests (9 tests passés).~~

---

### IA & comportement (réutilise nouvelles unités)

- [ ] Mettre à jour comportements des bots : priorités de production (p.ex. construire turrets vs tanks), réponse aux nouvelles menaces (EMP, submersibles).
- [ ] Fichiers cibles : `src/core/ai/` ou `src/core/game/*` (ex: TribeExecution, AiAttackBehavior).
- [ ] Tests : tests d'intégration nation/IA pour vérifier qu'ils construisent/réagissent.
- Estimation : 6–12h.

### Vision / réseau / Schema

- [ ] Vérifier si l'état submerged/radarDetected doit être ajouté aux messages réseau (`src/core/Schemas.ts`).
- [ ] S'assurer que `GameView`/GameUpdate envoie correctement les flags (révélation, disabled) au client sans casser le déterminisme.
- Estimation : 3–6h.

### UI / client

- [ ] BuildMenu : icônes définitives pour les 14 nouvelles unités, tooltips et descriptions.
- [ ] Sprites/icônes : ajouter assets dans `resources/icons` ou `proprietary/`.
- [ ] Mini-map / overlays : montrer détection radar, état EMP.
- [ ] Tests UI (si existants) et vérification manuelle.
- Estimation : 6–12h.

### Traductions

- [ ] Compléter `resources/lang/en.json` pour tous les nouveaux `unit_type` et `build_menu.desc`.
- [ ] Pousser vers Crowdin / pipeline de traduction si configuré.
- Estimation : 1–3h.

### Playtests & équilibrage

- [ ] Sessions de playtest solo et privées pour mesurer coût/puissance/usage.
- [ ] Collecter métriques : taux de construction, taux de destruction, temps de survie, or généré.
- [ ] Affiner `unitInfo()` (cost, health, build time, damage) et itérer.
- Estimation : variable (8–24h selon retours).

### Performance & Profiling

- [ ] Profiler ticks lourds (PlayerExecution, Port/StratPort, many trade spawns).
- [ ] Optimiser boucles : réduire traversées O(n²), limiter fréquence de checks.
- [ ] Tests de charge : jeu solo avec 8+ bots, mesures CPU/ticks.
- Estimation : 6–12h.

### Documentation & release

- [ ] Mettre à jour `docs/Architecture.md` : nouvelles unités, mécaniques (radar, EMP, submerge).
- [ ] Mettre à jour `resources/changelog.md` et `resources/version.txt`.
- [ ] Préparer notes de migration si modifications de schema.
- Estimation : 2–4h.

---

## Checklist / Priorités (ordre recommandé)

- [x] ~~1. Implémenter Executions Phase 2 (Ground units) + tests.~~
- [x] ~~2. Implémenter Executions Phase 3 (Naval + Radar) et tests.~~
- [x] ~~3. Armes avancées (EMP/Cruise/Orbital) + tests.~~
- [ ] 4. Mettre à jour IA pour utiliser nouvelles unités.
- [ ] 5. Tests d'intégration et playtests (iterate).
- [ ] 6. UI/icônes/traductions et synchronisation.
- [ ] 7. Perf profiling & doc release.

---

## Conseils techniques et points d'attention

- Respecter la contrainte : logique de `src/core/` doit rester déterministe (pas de `Math.random` non-seedé). Utiliser `PseudoRandom` et les patterns existants.
- Toujours ajouter tests pour chaque nouvelle Execution avant d'ajouter logique complexe.
- Les modifications qui changent l'API réseau doivent être limitées et rétro-compatibles ; ajouter flags optionnels plutôt que renommer champs.
- Pour la furtivité/submersion, le flag est modélisé sur l'`Unit` (`visibilityState().isSubmerged` / `isVisibleTo(player)`) — déjà implémenté.

---

## Estimation globale restante (ordre de grandeur)

- ~~Phase 2 : 6–10h~~ → **0h (terminée)**
- ~~Phase 3 : 12–20h~~ → **0h (terminée)**
- ~~Phase 4 : 16–30h~~ → **0h (terminée)**
- IA, Tests, UI, Traductions, Perf, Docs : **30–60h restants**

Total restant estimé : **30–60h** (selon profondeur du raffinement)
