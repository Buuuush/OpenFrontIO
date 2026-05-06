import { Execution, Game, Unit, UnitType } from "../game/Game";
import { ShellExecution } from "./ShellExecution";

/**
 * TankExecution: Ground-based mobile combat unit.
 * Moves towards nearby enemies and shoots them.
 */
export class TankExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  private target: Unit | null = null;
  private lastShellAttack = 0;
  private alreadySentShell = new Set<Unit>();

  constructor(private tank: Unit) {}

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
          this.tank.tile(),
          this.tank.owner(),
          this.tank,
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
    if (!this.tank.isActive()) {
      this.active = false;
      return;
    }

    // Do nothing while the tank is under construction
    if (this.tank.isUnderConstruction()) {
      return;
    }

    // Clear target if it becomes inactive
    if (this.target !== null && !this.target.isActive()) {
      this.target = null;
    }

    if (this.mg === null) return;

    // Target nearby land-based enemy units within combat range
    const enemies = this.mg
      .nearbyUnits(
        this.tank.tile(),
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
          this.tank !== null &&
          unit.owner() !== this.tank.owner() &&
          !unit.owner().isFriendly(this.tank.owner()) &&
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
