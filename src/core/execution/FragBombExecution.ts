import { Execution, Game, Player, UnitType } from "../game/Game";
import { TileRef } from "../game/GameMap";

/**
 * FragBombExecution: Fragmentation bomb that scatters shrapnel across an area.
 * Deals moderate damage to multiple units in a wide radius.
 */
export class FragBombExecution implements Execution {
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

    this.explode();
    this.active = false;
  }

  private explode(): void {
    if (!this.mg) return;

    const blastRadius = 6; // Wide fragmentation area
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

    const baseDamage = this.mg.config().unitInfo(UnitType.FragBomb).damage ?? 400;

    for (const { unit, distSquared } of nearbyUnits) {
      // Shrapnel scatters relatively evenly — linear falloff
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
