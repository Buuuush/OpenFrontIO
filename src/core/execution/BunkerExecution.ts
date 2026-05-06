import { Execution, Game, Unit } from "../game/Game";

/**
 * BunkerExecution: Static defensive structure with no active behavior.
 * Bunkers simply exist and provide defensive cover (visual/flavor).
 * In future phases, they could provide bonuses to nearby units.
 */
export class BunkerExecution implements Execution {
  private active: boolean = true;
  private mg: Game | null = null;

  constructor(private bunker: Unit) {}

  init(mg: Game, ticks: number): void {
    this.mg = mg;
  }

  tick(ticks: number): void {
    if (!this.bunker.isActive()) {
      this.active = false;
      return;
    }
    // Bunker is passive — no active logic this phase
  }

  isActive(): boolean {
    return this.active;
  }

  activeDuringSpawnPhase(): boolean {
    return false;
  }
}
