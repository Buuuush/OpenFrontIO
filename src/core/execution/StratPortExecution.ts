import { Execution, Game, Unit, UnitType } from "../game/Game";
import { PseudoRandom } from "../PseudoRandom";
import { TradeShipExecution } from "./TradeShipExecution";
import { TrainStationExecution } from "./TrainStationExecution";

/**
 * StratPortExecution: Strategic port for naval economy.
 * Similar to Port, but enhanced for strategic gameplay:
 * - Spawns trade ships between friendly ports
 * - Creates/manages train stations for rail commerce
 */
export class StratPortExecution implements Execution {
  private active = true;
  private mg: Game | null = null;
  private port: Unit;
  private random: PseudoRandom | null = null;
  private checkOffset: number = 0;
  private tradeShipSpawnRejections = 0;

  constructor(port: Unit) {
    this.port = port;
  }

  init(mg: Game, ticks: number): void {
    this.mg = mg;
    this.random = new PseudoRandom(mg.ticks());
    this.checkOffset = mg.ticks() % 10;
  }

  tick(ticks: number): void {
    if (this.mg === null || this.random === null) {
      throw new Error("StratPortExecution not initialized");
    }

    if (!this.port.isActive()) {
      this.active = false;
      return;
    }

    if (this.port.isUnderConstruction()) {
      return;
    }

    if (!this.port.hasTrainStation()) {
      this.createStation();
    }

    // Only check every 10 ticks for performance.
    if ((this.mg.ticks() + this.checkOffset) % 10 !== 0) {
      return;
    }

    if (!this.shouldSpawnTradeShip()) {
      return;
    }

    const ports = this.tradingPorts();

    if (ports.length === 0) {
      return;
    }

    const targetPort = this.random.randElement(ports);
    this.mg.addExecution(
      new TradeShipExecution(this.port.owner(), this.port, targetPort),
    );
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }

  private createStation() {
    if (this.mg === null) return;
    this.mg.addExecution(new TrainStationExecution(this.port));
  }

  private shouldSpawnTradeShip(): boolean {
    if (this.mg === null || this.random === null) return false;

    const numTradeShips = this.mg.unitCount(UnitType.TradeShip);
    const spawnRate = this.mg
      .config()
      .tradeShipSpawnRate(this.tradeShipSpawnRejections, numTradeShips);

    for (let i = 0; i < this.port.level(); i++) {
      if (this.random.chance(spawnRate)) {
        this.tradeShipSpawnRejections = 0;
        return true;
      }
      this.tradeShipSpawnRejections++;
    }
    return false;
  }

  private tradingPorts(): Unit[] {
    if (this.mg === null) return [];

    const sourceComponents = new Set<number>();
    for (const neighbor of this.mg.neighbors(this.port.tile())) {
      if (!this.mg.isWater(neighbor)) continue;
      const comp = this.mg.getWaterComponent(neighbor);
      if (comp !== null) sourceComponents.add(comp);
    }

    const ports = this.mg
      .players()
      .filter((p) => p !== this.port.owner() && p.canTrade(this.port.owner()))
      .flatMap((p) =>
        p.units(UnitType.Port).concat(p.units(UnitType.StratPort)),
      )
      .filter((p) => {
        for (const comp of sourceComponents) {
          if (this.mg!.hasWaterComponent(p.tile(), comp)) return true;
        }
        return false;
      })
      .sort((p1, p2) => {
        return (
          this.mg!.manhattanDist(this.port.tile(), p1.tile()) -
          this.mg!.manhattanDist(this.port.tile(), p2.tile())
        );
      });

    return ports;
  }
}
