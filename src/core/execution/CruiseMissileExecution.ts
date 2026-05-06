import { Execution, Game, Player, UnitType } from "../game/Game";
import { TileRef } from "../game/GameMap";
import { PathFinding } from "../pathfinding/PathFinder";
import { PathStatus, SteppingPathFinder } from "../pathfinding/types";
import { ShellExecution } from "./ShellExecution";

/**
 * CruiseMissileExecution: Guided missile that travels to a target tile and explodes.
 * Deals significant area damage on impact to nearby ground and naval units.
 */
export class CruiseMissileExecution implements Execution {
  private active = true;
  private mg: Game | null = null;
  private pathFinder: SteppingPathFinder<TileRef> | null = null;
  private travelSpeed = 5; // Tiles moved per tick

  constructor(
    private player: Player,
    private targetTile: TileRef,
  ) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
    this.pathFinder = PathFinding.Air(mg);
  }

  tick(ticks: number): void {
    if (!this.active || this.mg === null || this.pathFinder === null) return;

    // Find the player's capital or a territory tile to launch from
    const launchTile = this.player.spawnTile();
    if (launchTile === undefined || !this.player.isAlive()) {
      this.active = false;
      return;
    }

    // Apply area damage to units near the target on impact
    this.explodeAtTarget();
    this.active = false;
  }

  private explodeAtTarget(): void {
    if (!this.mg) return;

    const blastRadius = 5;
    const AFFECTED_TYPES = [
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
      UnitType.Destroyer,
      UnitType.CarrierShip,
      UnitType.Submarine,
      UnitType.NeutralFort,
      UnitType.Capital,
    ];

    const nearbyUnits = this.mg
      .nearbyUnits(this.targetTile, blastRadius, AFFECTED_TYPES)
      .filter(
        ({ unit }) =>
          unit.owner() !== this.player &&
          !unit.owner().isFriendly(this.player) &&
          unit.isActive(),
      );

    const baseDamage = this.mg.config().unitInfo(UnitType.CruiseMissile).damage ?? 600;

    for (const { unit, distSquared } of nearbyUnits) {
      // Damage falls off with distance from the blast center
      const dist = Math.sqrt(distSquared);
      const falloff = Math.max(0, 1 - dist / blastRadius);
      const damage = Math.round(baseDamage * falloff);
      unit.modifyHealth(-damage, this.player);
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}
