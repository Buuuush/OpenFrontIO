import {
  Execution,
  Game,
  Unit,
  UnitType,
} from "../game/Game";
import { AttackDroneExecution } from "./AttackDroneExecution";

/**
 * CarrierShipExecution: Mobile airbase that launches attack drones.
 * Carriers can build and deploy attack drones periodically.
 */
export class CarrierShipExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  private ticksUntilNextDrone = 0;
  private dronesLaunched = 0;
  private maxDrones = 3; // Maximum drones a carrier can have active

  constructor(private carrier: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;

    // Initial delay before first drone launch
    const buildTime = this.mg.config().unitInfo(UnitType.AttackDrone).constructionDuration ?? 60;
    this.ticksUntilNextDrone = Math.floor(buildTime * 0.5); // Start building after half the time
  }

  tick(ticks: number): void {
    if (!this.carrier.isActive()) {
      this.active = false;
      return;
    }

    // Do nothing while the carrier is under construction
    if (this.carrier.isUnderConstruction()) {
      return;
    }

    if (this.mg === null) return;

    // Count currently active drones owned by this player
    const activeDrones = this.carrier
      .owner()
      .units(UnitType.AttackDrone)
      .filter(drone => drone.isActive() && !drone.isUnderConstruction())
      .length;

    // Launch drones if we haven't reached max and it's time
    if (this.dronesLaunched < this.maxDrones && activeDrones < this.maxDrones) {
      this.ticksUntilNextDrone--;

      if (this.ticksUntilNextDrone <= 0) {
        this.launchDrone();

        // Reset timer for next drone
        const buildTime = this.mg.config().unitInfo(UnitType.AttackDrone).constructionDuration ?? 60;
        this.ticksUntilNextDrone = buildTime;
        this.dronesLaunched++;
      }
    }
  }

  private launchDrone(): void {
    // Find a valid spawn tile near the carrier
    const spawnTile = this.carrier.owner().canBuild(UnitType.AttackDrone, this.carrier.tile());

    if (spawnTile !== false) {
      const drone = this.carrier.owner().buildUnit(
        UnitType.AttackDrone,
        spawnTile,
        {}
      );

      // Add the drone execution
      this.mg.addExecution(new AttackDroneExecution(drone));
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}