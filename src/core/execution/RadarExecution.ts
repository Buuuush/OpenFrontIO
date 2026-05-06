import {
  Execution,
  Game,
  Unit,
  UnitType,
} from "../game/Game";

/**
 * RadarExecution: Detection structure that reveals submerged units.
 * Periodically scans for submarines and marks them as radar-detected,
 * making them visible to all players.
 */
export class RadarExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  private ticksUntilNextScan = 0;

  constructor(private radar: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;

    // Initial delay before first scan
    const scanInterval = this.mg.config().radarScanInterval();
    this.ticksUntilNextScan = Math.floor(scanInterval * 0.5); // Start scanning after half the interval
  }

  tick(ticks: number): void {
    if (!this.radar.isActive()) {
      this.active = false;
      return;
    }

    // Do nothing while the radar is under construction
    if (this.radar.isUnderConstruction()) {
      return;
    }

    if (this.mg === null) return;

    // Decrease timer and scan when ready
    this.ticksUntilNextScan--;

    if (this.ticksUntilNextScan <= 0) {
      this.scanForSubmarines();

      // Reset timer for next scan
      const scanInterval = this.mg.config().radarScanInterval();
      this.ticksUntilNextScan = scanInterval;
    }
  }

  private scanForSubmarines(): void {
    if (!this.mg) return;

    const radarRange = this.mg.config().radarDetectionRange();
    const radarTile = this.radar.tile();

    // Find all submarines within radar range
    const submarinesInRange = this.mg
      .nearbyUnits(
        radarTile,
        radarRange,
        [UnitType.Submarine],
      )
      .filter(
        ({ unit }) =>
          unit.owner() !== this.radar.owner() && // Only enemy submarines
          !unit.owner().isFriendly(this.radar.owner()) && // Not allied
          unit.isActive() && // Still active
          !unit.isUnderConstruction() && // Not under construction
          unit.visibilityState().isSubmerged && // Actually submerged
          !unit.visibilityState().radarDetected // Not already detected
      );

    // Mark discovered submarines as radar-detected
    for (const { unit: submarine } of submarinesInRange) {
      submarine.updateVisibilityState({
        radarDetected: true,
      });

      // Optional: Trigger a discovery event or message
      // This could be expanded to show a notification or mini-map ping
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}