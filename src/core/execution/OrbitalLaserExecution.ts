import { Execution, Game, Player, UnitType } from "../game/Game";
import { TileRef } from "../game/GameMap";

/**
 * OrbitalLaserExecution: High-energy laser fired from orbit.
 * Instantly hits the target tile and deals massive damage in a small area.
 * No travel time — the strike is immediate.
 */
export class OrbitalLaserExecution implements Execution {
  private active = true;
  private mg: Game | null = null;

  constructor(
    private player: Player,
    private targetTile: TileRef,
  ) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
  }

  tick(ticks: number): void {
    if (!this.active || this.mg === null) return;

    if (!this.player.isAlive()) {
      this.active = false;
      return;
    }

    // Orbital laser strikes immediately on the first tick
    this.strikeTarget();
    this.active = false;
  }

  private strikeTarget(): void {
    if (!this.mg) return;

    const blastRadius = 3; // Smaller radius than cruise missile but higher damage
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
      UnitType.MissileSilo,
    ];

    const nearbyUnits = this.mg
      .nearbyUnits(this.targetTile, blastRadius, AFFECTED_TYPES)
      .filter(
        ({ unit }) =>
          unit.owner() !== this.player &&
          !unit.owner().isFriendly(this.player) &&
          unit.isActive(),
      );

    const baseDamage = this.mg.config().unitInfo(UnitType.OrbitalLaser).damage ?? 1200;

    for (const { unit, distSquared } of nearbyUnits) {
      // Orbital laser has a tight beam — full damage at center, sharper falloff
      const dist = Math.sqrt(distSquared);
      const falloff = Math.max(0, 1 - dist / blastRadius);
      const damage = Math.round(baseDamage * falloff * falloff); // Quadratic falloff
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
