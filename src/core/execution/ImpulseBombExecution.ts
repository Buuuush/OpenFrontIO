import { Execution, Game, Player, UnitType } from "../game/Game";
import { TileRef } from "../game/GameMap";

/**
 * ImpulseBombExecution: Electromagnetic impulse bomb.
 * Deals moderate damage and disables electronic units in the blast area.
 * Combines kinetic damage with EMP-like disruption.
 */
export class ImpulseBombExecution implements Execution {
  private active = true;
  private mg: Game | null = null;

  // Unit types vulnerable to the impulse disruption
  private static readonly ELECTRONIC_TYPES: UnitType[] = [
    UnitType.Warship,
    UnitType.Destroyer,
    UnitType.CarrierShip,
    UnitType.Submarine,
    UnitType.Tank,
    UnitType.Artillery,
    UnitType.AttackDrone,
    UnitType.SAMLauncher,
    UnitType.MissileSilo,
    UnitType.Radar,
  ];

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

    const blastRadius = 4;
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
      UnitType.Radar,
    ];

    const nearbyUnits = this.mg
      .nearbyUnits(this.targetTile, blastRadius, AFFECTED_TYPES)
      .filter(
        ({ unit }) =>
          unit.owner() !== this.player &&
          !unit.owner().isFriendly(this.player) &&
          unit.isActive(),
      );

    const baseDamage = this.mg.config().unitInfo(UnitType.ImpulseBomb).damage ?? 350;

    for (const { unit, distSquared } of nearbyUnits) {
      const dist = Math.sqrt(distSquared);
      const falloff = Math.max(0, 1 - dist / blastRadius);
      const damage = Math.round(baseDamage * falloff);
      unit.modifyHealth(-damage, this.player);

      // Extra damage to electronic units (impulse disruption)
      const isElectronic = ImpulseBombExecution.ELECTRONIC_TYPES.includes(unit.type());
      if (isElectronic) {
        const bonusDamage = Math.round(baseDamage * 0.3 * falloff);
        unit.modifyHealth(-bonusDamage, this.player);
      }
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}
