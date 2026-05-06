import { Execution, Game, Unit, UnitType } from "../game/Game";
import { ShellExecution } from "./ShellExecution";

/**
 * TurretAntiInfExecution: Ground-to-ground defensive turret.
 * Targets land-based enemy units within range and shoots shells.
 */
export class TurretAntiInfExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  private target: Unit | null = null;
  private lastShellAttack = 0;
  private alreadySentShell = new Set<Unit>();

  constructor(private turret: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
  }

  private shoot(): void {
    if (this.target === null || this.mg === null) return;
    const shellAttackRate = this.mg.config().defensePostShellAttackRate();
    if (this.mg.ticks() - this.lastShellAttack > shellAttackRate) {
      this.lastShellAttack = this.mg.ticks();
      this.mg.addExecution(
        new ShellExecution(
          this.turret.tile(),
          this.turret.owner(),
          this.turret,
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
    if (!this.turret.isActive()) {
      this.active = false;
      return;
    }

    // Do nothing while the turret is under construction
    if (this.turret.isUnderConstruction()) {
      return;
    }

    // Clear target if it becomes inactive
    if (this.target !== null && !this.target.isActive()) {
      this.target = null;
    }

    if (this.mg === null) return;

    // Target nearby land-based enemy units
    const enemies = this.mg
      .nearbyUnits(
        this.turret.tile(),
        this.mg.config().defensePostTargettingRange(),
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
          this.turret !== null &&
          unit.owner() !== this.turret.owner() &&
          !unit.owner().isFriendly(this.turret.owner()) &&
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
