import {
  Execution,
  Game,
  Unit,
  UnitType,
} from "../game/Game";
import { ShellExecution } from "./ShellExecution";

/**
 * SubmarineExecution: Stealth naval unit that can submerge to avoid detection.
 * Submarines are invisible to enemy units unless detected by radar.
 */
export class SubmarineExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  private target: Unit | null = null;
  private lastShellAttack = 0;
  private alreadySentShell = new Set<Unit>();

  constructor(private submarine: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
  }

  private shoot(): void {
    if (this.target === null || this.mg === null) return;
    // Submarines shoot at same rate as destroyers for balance
    const shellAttackRate = this.mg.config().warshipShellAttackRate();
    if (this.mg.ticks() - this.lastShellAttack > shellAttackRate) {
      this.lastShellAttack = this.mg.ticks();
      this.mg.addExecution(
        new ShellExecution(
          this.submarine.tile(),
          this.submarine.owner(),
          this.submarine,
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
    if (!this.submarine.isActive()) {
      this.active = false;
      return;
    }

    // Do nothing while the submarine is under construction
    if (this.submarine.isUnderConstruction()) {
      return;
    }

    // Clear target if it becomes inactive
    if (this.target !== null && !this.target.isActive()) {
      this.target = null;
    }

    if (this.mg === null) return;

    // Target nearby enemy unit ships within range (submarines hunt ships)
    // Only target units that can actually see the submarine (considering stealth)
    const targetingRange = this.mg.config().warshipTargettingRange();
    const potentialTargets = this.mg
      .nearbyUnits(
        this.submarine.tile(),
        targetingRange,
        [
          UnitType.TransportShip,
          UnitType.TradeShip,
          UnitType.Warship,
          UnitType.Submarine,
          UnitType.Destroyer,
          UnitType.CarrierShip,
        ],
      )
      .filter(
        ({ unit }) =>
          this.submarine !== null &&
          unit.owner() !== this.submarine.owner() &&
          !unit.owner().isFriendly(this.submarine.owner()) &&
          // Check if the submarine is visible to the enemy unit
          this.submarine.isVisibleTo(unit.owner()) &&
          !this.alreadySentShell.has(unit),
      );

    if (potentialTargets.length === 0) {
      this.target = null;
    } else {
      // Prioritize closest target
      this.target = potentialTargets.sort(
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