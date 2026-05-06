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

describe("Phase 2 Units", () => {
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

    // Conquer tiles for both players
    player1.conquer(game.ref(5, 5));
    player2.conquer(game.ref(15, 15));
  });

  describe("Tank", () => {
    test("can build tank", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.Tank, game.ref(5, 5), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });

    test("tank has correct max health", () => {
      const tank = player1.buildUnit(UnitType.Tank, game.ref(5, 5), {});
      const maxHealth = game.config().unitInfo(UnitType.Tank).maxHealth;
      expect(tank.health()).toBe(maxHealth);
    });

    test("tank can exist without errors", () => {
      const tank = player1.buildUnit(UnitType.Tank, game.ref(5, 5), {});
      expect(tank.isActive()).toBe(true);
      
      // Tick several times to ensure no runtime errors
      for (let i = 0; i < 50; i++) {
        game.executeNextTick();
      }
      
      expect(tank.isActive()).toBe(true);
    });
  });

  describe("Artillery", () => {
    test("can build artillery", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.Artillery, game.ref(5, 6), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });

    test("artillery has correct max health", () => {
      const artillery = player1.buildUnit(UnitType.Artillery, game.ref(5, 6), {});
      const maxHealth = game.config().unitInfo(UnitType.Artillery).maxHealth;
      expect(artillery.health()).toBe(maxHealth);
    });

    test("artillery can exist without errors", () => {
      const artillery = player1.buildUnit(UnitType.Artillery, game.ref(5, 6), {});
      expect(artillery.isActive()).toBe(true);
      
      // Tick several times to ensure no runtime errors
      for (let i = 0; i < 50; i++) {
        game.executeNextTick();
      }
      
      expect(artillery.isActive()).toBe(true);
    });
  });

  describe("AttackDrone", () => {
    test("can build attack drone", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.AttackDrone, game.ref(5, 7), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });

    test("attack drone has correct max health", () => {
      const drone = player1.buildUnit(UnitType.AttackDrone, game.ref(5, 7), {});
      const maxHealth = game.config().unitInfo(UnitType.AttackDrone).maxHealth;
      expect(drone.health()).toBe(maxHealth);
    });

    test("attack drone can exist without errors", () => {
      const drone = player1.buildUnit(UnitType.AttackDrone, game.ref(5, 7), {});
      expect(drone.isActive()).toBe(true);
      
      // Tick several times to ensure no runtime errors
      for (let i = 0; i < 50; i++) {
        game.executeNextTick();
      }
      
      expect(drone.isActive()).toBe(true);
    });
  });

  describe("Phase 2 units integration", () => {
    test("all phase 2 units have valid config", () => {
      const phase2Units = [
        UnitType.Tank,
        UnitType.Artillery,
        UnitType.AttackDrone,
      ];

      for (const unitType of phase2Units) {
        const info = game.config().unitInfo(unitType);
        expect(info).toBeDefined();
        expect(info.cost).toBeDefined();
        expect(info.maxHealth).toBeGreaterThan(0);
        expect(info.damage).toBeGreaterThan(0);
      }
    });

    test("phase 2 units can coexist with phase 1 structures", () => {
      const tank = player1.buildUnit(UnitType.Tank, game.ref(5, 5), {});
      const turret = player1.buildUnit(UnitType.TurretAntiInf, game.ref(6, 5), {});
      const bunker = player1.buildUnit(UnitType.Bunker, game.ref(5, 6), {});

      expect(tank.isActive()).toBe(true);
      expect(turret.isActive()).toBe(true);
      expect(bunker.isActive()).toBe(true);

      game.executeNextTick();

      expect(tank.isActive()).toBe(true);
      expect(turret.isActive()).toBe(true);
      expect(bunker.isActive()).toBe(true);
    });

    test("multiple tanks can coexist without errors", () => {
      const tank1 = player1.buildUnit(UnitType.Tank, game.ref(5, 5), {});
      const tank2 = player1.buildUnit(UnitType.Tank, game.ref(5, 6), {});
      const artillery = player1.buildUnit(UnitType.Artillery, game.ref(4, 5), {});
      const drone = player2.buildUnit(UnitType.AttackDrone, game.ref(7, 7), {});

      expect(tank1.isActive()).toBe(true);
      expect(tank2.isActive()).toBe(true);
      expect(artillery.isActive()).toBe(true);
      expect(drone.isActive()).toBe(true);

      // Tick and verify all units remain active
      for (let i = 0; i < 100; i++) {
        game.executeNextTick();
      }

      expect(tank1.isActive()).toBe(true);
      expect(tank2.isActive()).toBe(true);
      expect(artillery.isActive()).toBe(true);
      expect(drone.isActive()).toBe(true);
    });
  });
});
