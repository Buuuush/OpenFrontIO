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
let player2: Player;

describe("Phase 3 Naval & Detection Units", () => {
  beforeEach(async () => {
    game = await setup(
      "plains",
      {
        infiniteGold: true,
        instantBuild: true,
      },
      [
        new PlayerInfo("p1", PlayerType.Human, "c1", "p1_id"),
        new PlayerInfo("p2", PlayerType.Bot, "c2", "p2_id"),
      ],
    );

    while (game.inSpawnPhase()) {
      game.executeNextTick();
    }

    player1 = game.player("p1_id");
    player2 = game.player("p2_id");

    player1.conquer(game.ref(5, 5));
    player2.conquer(game.ref(15, 15));
  });

  describe("Submarine", () => {
    test("can build submarine", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.Submarine, game.ref(5, 5), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });

    test("submarine has correct max health", () => {
      const sub = player1.buildUnit(UnitType.Submarine, game.ref(5, 5), {});
      const maxHealth = game.config().unitInfo(UnitType.Submarine).maxHealth;
      expect(sub.health()).toBe(maxHealth);
    });

    test("submarine can exist without errors", () => {
      const sub = player1.buildUnit(UnitType.Submarine, game.ref(5, 5), {});
      expect(sub.isActive()).toBe(true);

      for (let i = 0; i < 50; i++) {
        game.executeNextTick();
      }

      expect(sub.isActive()).toBe(true);
    });

    test("submarine has valid visibility state", () => {
      const sub = player1.buildUnit(UnitType.Submarine, game.ref(5, 5), {});
      const visibility = sub.visibilityState();
      expect(visibility).toBeDefined();
      expect(typeof visibility.isSubmerged).toBe("boolean");
      expect(typeof visibility.radarDetected).toBe("boolean");
    });
  });

  describe("Destroyer", () => {
    test("can build destroyer", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.Destroyer, game.ref(5, 5), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });

    test("destroyer has correct max health", () => {
      const destroyer = player1.buildUnit(UnitType.Destroyer, game.ref(5, 5), {});
      const maxHealth = game.config().unitInfo(UnitType.Destroyer).maxHealth;
      expect(destroyer.health()).toBe(maxHealth);
    });

    test("destroyer can exist without errors", () => {
      const destroyer = player1.buildUnit(UnitType.Destroyer, game.ref(5, 5), {});
      expect(destroyer.isActive()).toBe(true);

      for (let i = 0; i < 50; i++) {
        game.executeNextTick();
      }

      expect(destroyer.isActive()).toBe(true);
    });
  });

  describe("CarrierShip", () => {
    test("can build carrier ship", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.CarrierShip, game.ref(5, 5), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });

    test("carrier ship has correct max health", () => {
      const carrier = player1.buildUnit(UnitType.CarrierShip, game.ref(5, 5), {});
      const maxHealth = game.config().unitInfo(UnitType.CarrierShip).maxHealth;
      expect(carrier.health()).toBe(maxHealth);
    });

    test("carrier ship can exist without errors", () => {
      const carrier = player1.buildUnit(UnitType.CarrierShip, game.ref(5, 5), {});
      expect(carrier.isActive()).toBe(true);

      for (let i = 0; i < 50; i++) {
        game.executeNextTick();
      }

      expect(carrier.isActive()).toBe(true);
    });
  });

  describe("Radar", () => {
    test("can build radar", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.Radar, game.ref(5, 5), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });

    test("radar has correct max health", () => {
      const radar = player1.buildUnit(UnitType.Radar, game.ref(5, 5), {});
      const maxHealth = game.config().unitInfo(UnitType.Radar).maxHealth;
      expect(radar.health()).toBe(maxHealth);
    });

    test("radar can exist without errors", () => {
      const radar = player1.buildUnit(UnitType.Radar, game.ref(5, 5), {});
      expect(radar.isActive()).toBe(true);

      for (let i = 0; i < 100; i++) {
        game.executeNextTick();
      }

      expect(radar.isActive()).toBe(true);
    });

    test("radar config provides scan interval and detection range", () => {
      expect(game.config().radarScanInterval()).toBeGreaterThan(0);
      expect(game.config().radarDetectionRange()).toBeGreaterThan(0);
    });
  });

  describe("Phase 3 units integration", () => {
    test("all phase 3 units have valid config", () => {
      const phase3Units = [
        UnitType.Submarine,
        UnitType.Destroyer,
        UnitType.CarrierShip,
        UnitType.Radar,
      ];

      for (const unitType of phase3Units) {
        const info = game.config().unitInfo(unitType);
        expect(info).toBeDefined();
        expect(info.cost).toBeDefined();
        if (info.maxHealth !== undefined) {
          expect(info.maxHealth).toBeGreaterThan(0);
        }
      }
    });

    test("naval units can coexist without errors", () => {
      const sub = player1.buildUnit(UnitType.Submarine, game.ref(5, 5), {});
      const destroyer = player1.buildUnit(UnitType.Destroyer, game.ref(6, 5), {});
      const carrier = player1.buildUnit(UnitType.CarrierShip, game.ref(7, 5), {});
      const radar = player1.buildUnit(UnitType.Radar, game.ref(5, 6), {});

      expect(sub.isActive()).toBe(true);
      expect(destroyer.isActive()).toBe(true);
      expect(carrier.isActive()).toBe(true);
      expect(radar.isActive()).toBe(true);

      for (let i = 0; i < 50; i++) {
        game.executeNextTick();
      }

      expect(sub.isActive()).toBe(true);
      expect(destroyer.isActive()).toBe(true);
      expect(carrier.isActive()).toBe(true);
      expect(radar.isActive()).toBe(true);
    });

    test("phase 3 units can coexist with phase 1 and 2 units", () => {
      const tank = player1.buildUnit(UnitType.Tank, game.ref(5, 5), {});
      const bunker = player1.buildUnit(UnitType.Bunker, game.ref(6, 5), {});
      const sub = player1.buildUnit(UnitType.Submarine, game.ref(7, 5), {});
      const radar = player1.buildUnit(UnitType.Radar, game.ref(5, 6), {});

      expect(tank.isActive()).toBe(true);
      expect(bunker.isActive()).toBe(true);
      expect(sub.isActive()).toBe(true);
      expect(radar.isActive()).toBe(true);

      game.executeNextTick();

      expect(tank.isActive()).toBe(true);
      expect(bunker.isActive()).toBe(true);
      expect(sub.isActive()).toBe(true);
      expect(radar.isActive()).toBe(true);
    });
  });
});
