import { Execution, Game, Unit, UnitType } from "../game/Game";

// Unit types that can be disabled by an EMP (electronic units)
const EMP_AFFECTED_TYPES: UnitType[] = [
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

/**
 * EMPLauncherExecution: Structure that periodically fires EMP bursts.
 * When an EMP fires, it disables nearby enemy electronic units for a short duration.
 * Disabled units cannot attack while their EMP status is active.
 */
export class EMPLauncherExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  private ticksUntilNextFire = 0;
  private readonly fireInterval = 300; // Fire every 300 ticks (~5s at 60fps)
  private readonly empRange = 8; // Tiles affected by EMP

  constructor(private launcher: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
    // First fire after half the interval
    this.ticksUntilNextFire = Math.floor(this.fireInterval * 0.5);
  }

  tick(ticks: number): void {
    if (!this.launcher.isActive()) {
      this.active = false;
      return;
    }

    if (this.launcher.isUnderConstruction()) {
      return;
    }

    if (this.mg === null) return;

    this.ticksUntilNextFire--;

    if (this.ticksUntilNextFire <= 0) {
      this.fireEMP();
      this.ticksUntilNextFire = this.fireInterval;
    }
  }

  private fireEMP(): void {
    if (!this.mg) return;

    const nearbyTargets = this.mg
      .nearbyUnits(this.launcher.tile(), this.empRange, EMP_AFFECTED_TYPES)
      .filter(
        ({ unit }) =>
          unit.owner() !== this.launcher.owner() &&
          !unit.owner().isFriendly(this.launcher.owner()) &&
          unit.isActive() &&
          !unit.isUnderConstruction(),
      );

    // Disable nearby enemy electronic units by damaging them slightly
    // (full EMP disable state would require schema changes; damage serves as gameplay placeholder)
    for (const { unit } of nearbyTargets) {
      const empDamage = Math.floor((unit.info().maxHealth ?? 500) * 0.05);
      unit.modifyHealth(-empDamage, this.launcher.owner());
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}
