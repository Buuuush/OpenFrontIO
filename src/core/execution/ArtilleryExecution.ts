import { Execution, Game, Unit, UnitType } from "../game/Game";
import { ShellExecution } from "./ShellExecution";

/**
 * ArtilleryExecution: Stationary ranged combat unit.
 * Targets land-based enemy units at extended range and shoots shells.
 */
export class ArtilleryExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  private target: Unit | null = null;
  private lastShellAttack = 0;
  private alreadySentShell = new Set<Unit>();

  constructor(private artillery: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
  }

  private shoot(): void {
    if (this.target === null || this.mg === null) return;
    // Artillery shoots slower than turrets for balance
    const shellAttackRate = this.mg.config().defensePostShellAttackRate() + 5;
    if (this.mg.ticks() - this.lastShellAttack > shellAttackRate) {
      this.lastShellAttack = this.mg.ticks();
      this.mg.addExecution(
        new ShellExecution(
          this.artillery.tile(),
          this.artillery.owner(),
          this.artillery,
          this.target,
        ),
      );
      if (!this.target.hasHealth()) {
        // Don't send multiple shells to target that can be oneshotted
        this.alreadySentShell.add(this.target);
        this.target = null;
        return;
      }
    }
  }

  tick(ticks: number): void {
    if (!this.artillery.isActive()) {
      this.active = false;
      return;
    }

    // Do nothing while the artillery is under construction
    if (this.artillery.isUnderConstruction()) {
      return;
    }

    // Clear target if it becomes inactive
    if (this.target !== null && !this.target.isActive()) {
      this.target = null;
    }

    if (this.mg === null) return;

    // Target nearby land-based enemy units at extended range
    // Artillery has slightly longer range than turrets
    const targetingRange = this.mg.config().defensePostTargettingRange() + 3;
    const enemies = this.mg
      .nearbyUnits(
        this.artillery.tile(),
        targetingRange,
        [
          UnitType.City,
          UnitType.Factory,
          UnitType.DefensePost,
          UnitType.SAMLauncher,
          UnitType.Tank,
          UnitType.Artillery,
          UnitType.AttackDrone,
          UnitType.Bunker,
          UnitType.TurretAntiInf,
          UnitType.TurretAntiNaval,
          UnitType.MineExtractor,
          UnitType.StratPort,
          UnitType.NeutralFort,
          UnitType.Capital,
          UnitType.SupplyCache,
        ],
      )
      .filter(
        ({ unit }) =>
          this.artillery !== null &&
          unit.owner() !== this.artillery.owner() &&
          !unit.owner().isFriendly(this.artillery.owner()) &&
          !this.alreadySentShell.has(unit),
      );

    if (enemies.length === 0) {
      this.target = null;
    } else {
      // Prioritize closest target
      this.target = enemies.sort(
        (a, b) => a.distSquared - b.distSquared,
      )[0].unit;
    }

    this.shoot();
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}
