import {
  Execution,
  Game,
  Unit,
  UnitType,
} from "../game/Game";
import { ShellExecution } from "./ShellExecution";

/**
 * DestroyerExecution: Anti-submarine naval unit.
 * Specialized in detecting and destroying submarines.
 */
export class DestroyerExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  private target: Unit | null = null;
  private lastShellAttack = 0;
  private alreadySentShell = new Set<Unit>();

  constructor(private destroyer: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
  }

  private shoot(): void {
    if (this.target === null || this.mg === null) return;
    // Destroyers shoot at same rate as warships
    const shellAttackRate = this.mg.config().warshipShellAttackRate();
    if (this.mg.ticks() - this.lastShellAttack > shellAttackRate) {
      this.lastShellAttack = this.mg.ticks();
      this.mg.addExecution(
        new ShellExecution(
          this.destroyer.tile(),
          this.destroyer.owner(),
          this.destroyer,
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
    if (!this.destroyer.isActive()) {
      this.active = false;
      return;
    }

    // Do nothing while the destroyer is under construction
    if (this.destroyer.isUnderConstruction()) {
      return;
    }

    // Clear target if it becomes inactive
    if (this.target !== null && !this.target.isActive()) {
      this.target = null;
    }

    if (this.mg === null) return;

    // Destroyers prioritize submarines, then regular ships
    const targetingRange = this.mg.config().warshipTargettingRange();
    const potentialTargets = this.mg
      .nearbyUnits(
        this.destroyer.tile(),
        targetingRange,
        [
          UnitType.Submarine, // Priority 1: submarines
          UnitType.TransportShip,
          UnitType.TradeShip,
          UnitType.Warship,
          UnitType.Destroyer,
          UnitType.CarrierShip,
        ],
      )
      .filter(
        ({ unit }) =>
          this.destroyer !== null &&
          unit.owner() !== this.destroyer.owner() &&
          !unit.owner().isFriendly(this.destroyer.owner()) &&
          !this.alreadySentShell.has(unit),
      );

    if (potentialTargets.length === 0) {
      this.target = null;
    } else {
      // Sort by priority: submarines first, then by distance
      this.target = potentialTargets
        .sort((a, b) => {
          // Submarines get priority (lower type value = higher priority)
          const aIsSub = a.unit.type() === UnitType.Submarine ? 0 : 1;
          const bIsSub = b.unit.type() === UnitType.Submarine ? 0 : 1;

          if (aIsSub !== bIsSub) {
            return aIsSub - bIsSub;
          }
          // Same priority, sort by distance
          return a.distSquared - b.distSquared;
        })
        [0].unit;
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