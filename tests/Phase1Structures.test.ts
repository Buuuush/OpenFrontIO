import {
  Game,
  Player,
  PlayerInfo,
  PlayerType,
  UnitType,
} from "../src/core/game/Game";
import { setup } from "./util/Setup";

let game: Game;
let player1: Player;

describe("Phase 1 Structures", () => {
  beforeEach(async () => {
    game = await setup(
      "plains",
      {
        infiniteGold: true,
        instantBuild: true,
      },
      [new PlayerInfo("p1", PlayerType.Human, "c1", "p1_id")],
    );

    while (game.inSpawnPhase()) {
      game.executeNextTick();
    }

    player1 = game.player("p1_id");
    player1.conquer(game.ref(5, 5));
  });

  describe("Bunker", () => {
    test("can build bunker", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.Bunker, game.ref(5, 5), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });

    test("bunker has correct max health", () => {
      const bunker = player1.buildUnit(UnitType.Bunker, game.ref(5, 5), {});
      const maxHealth = game.config().unitInfo(UnitType.Bunker).maxHealth;
      expect(bunker.health()).toBe(maxHealth);
    });
  });

  describe("TurretAntiInf", () => {
    test("can build turret anti-inf", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.TurretAntiInf, game.ref(5, 6), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });
  });

  describe("TurretAntiNaval", () => {
    test("can build turret anti-naval", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.TurretAntiNaval, game.ref(5, 7), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });
  });

  describe("MineExtractor", () => {
    test("can build mine extractor", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.MineExtractor, game.ref(6, 5), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });
  });

  describe("StratPort", () => {
    test("can build strategic port on coast", () => {
      // Find a coast tile
      let coastTile: number | null = null;
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const tile = game.ref(x, y);
          if (game.isWater(tile)) {
            coastTile = tile;
            break;
          }
        }
        if (coastTile) break;
      }

      if (coastTile !== null) {
        player1.conquer(coastTile);
        const before = player1.units().length;
        player1.buildUnit(UnitType.StratPort, coastTile, {});
        game.executeNextTick();
        const after = player1.units().length;
        expect(after).toBe(before + 1);
      }
    });
  });

  test("all phase 1 structures are buildable", () => {
    const phase1Structures = [
      UnitType.Bunker,
      UnitType.TurretAntiInf,
      UnitType.TurretAntiNaval,
      UnitType.MineExtractor,
      UnitType.StratPort,
    ];

    for (const unitType of phase1Structures) {
      const info = game.config().unitInfo(unitType);
      expect(info).toBeDefined();
      expect(info.cost).toBeDefined();
      if (info.maxHealth !== undefined) {
        expect(info.maxHealth).toBeGreaterThan(0);
      }
    }
  });
});
