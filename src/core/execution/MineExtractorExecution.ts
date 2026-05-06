import { Execution, Game, Unit } from "../game/Game";

/**
 * MineExtractorExecution: Passive gold generation structure.
 * Each active mine generates a small amount of gold per tick.
 */
export class MineExtractorExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;
  private lastGoldTick = 0;

  constructor(private mine: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
    this.lastGoldTick = ticks;
  }

  tick(ticks: number): void {
    if (!this.mine.isActive()) {
      this.active = false;
      return;
    }

    // Do nothing while mine is under construction
    if (this.mine.isUnderConstruction()) {
      return;
    }

    if (this.mg === null) return;

    // Generate gold every 10 ticks (0.1 gold per tick = 1 gold per 10 ticks)
    const goldGenerationRate = 10;
    if (ticks - this.lastGoldTick >= goldGenerationRate) {
      this.lastGoldTick = ticks;
      const goldPerMinute = 1n; // 1 gold per 10 ticks = ~6 gold per minute
      this.mine.owner().addGold(goldPerMinute);

      // Optional: Track stats for mine contribution
      this.mg.stats().goldWork(this.mine.owner(), goldPerMinute);
    }
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}
