import { Execution, Game, Unit, UnitType } from "../game/Game";
import { ShellExecution } from "./ShellExecution";

/**
 * AttackDroneExecution: Fast aerial combat unit.
 * Patrols and targets nearby enemy units with quick shots.
 */
export class AttackDroneExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  private target: Unit | null = null;
  private lastShellAttack = 0;
  private alreadySentShell = new Set<Unit>();

  constructor(private drone: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
  }

  private shoot(): void {
    if (this.target === null || this.mg === null) return;
    // Drones shoot faster than ground units for balance
    const shellAttackRate = this.mg.config().defensePostShellAttackRate() - 3;
    if (this.mg.ticks() - this.lastShellAttack > shellAttackRate) {
      this.lastShellAttack = this.mg.ticks();
      this.mg.addExecution(
        new ShellExecution(
          this.drone.tile(),
          this.drone.owner(),
          this.drone,
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
    if (!this.drone.isActive()) {
      this.active = false;
      return;
    }

    // Do nothing while the drone is under construction
    if (this.drone.isUnderConstruction()) {
      return;
    }

    // Clear target if it becomes inactive
    if (this.target !== null && !this.target.isActive()) {
      this.target = null;
    }

    if (this.mg === null) return;

    // Target nearby enemy units within medium range (drones are mobile)
    const targetingRange = this.mg.config().defensePostTargettingRange();
    const enemies = this.mg
      .nearbyUnits(
        this.drone.tile(),
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
          UnitType.Warship,
          UnitType.TransportShip,
          UnitType.NeutralFort,
          UnitType.Capital,
          UnitType.SupplyCache,
        ],
      )
      .filter(
        ({ unit }) =>
          this.drone !== null &&
          unit.owner() !== this.drone.owner() &&
          !unit.owner().isFriendly(this.drone.owner()) &&
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
