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

describe("Phase 4 Advanced Weapons", () => {
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

  describe("EMPLauncher", () => {
    test("can build EMP launcher", () => {
      const before = player1.units().length;
      player1.buildUnit(UnitType.EMPLauncher, game.ref(5, 5), {});
      game.executeNextTick();
      const after = player1.units().length;
      expect(after).toBe(before + 1);
    });

    test("EMP launcher has correct max health", () => {
      const emp = player1.buildUnit(UnitType.EMPLauncher, game.ref(5, 5), {});
      const maxHealth = game.config().unitInfo(UnitType.EMPLauncher).maxHealth;
      expect(emp.health()).toBe(maxHealth);
    });

    test("EMP launcher can exist without errors", () => {
      const emp = player1.buildUnit(UnitType.EMPLauncher, game.ref(5, 5), {});
      expect(emp.isActive()).toBe(true);

      for (let i = 0; i < 100; i++) {
        game.executeNextTick();
      }

      expect(emp.isActive()).toBe(true);
    });
  });

  describe("Phase 4 units config", () => {
    test("all phase 4 units have valid config", () => {
      const phase4Units = [
        UnitType.EMPLauncher,
        UnitType.CruiseMissile,
        UnitType.FragBomb,
        UnitType.ImpulseBomb,
        UnitType.OrbitalLaser,
      ];

      for (const unitType of phase4Units) {
        const info = game.config().unitInfo(unitType);
        expect(info).toBeDefined();
        expect(info.cost).toBeDefined();
      }
    });

    test("CruiseMissile has damage configured", () => {
      const info = game.config().unitInfo(UnitType.CruiseMissile);
      expect(info.damage).toBeDefined();
      expect(info.damage!).toBeGreaterThan(0);
    });

    test("OrbitalLaser has damage configured", () => {
      const info = game.config().unitInfo(UnitType.OrbitalLaser);
      expect(info.damage).toBeDefined();
      expect(info.damage!).toBeGreaterThan(0);
    });

    test("FragBomb has damage configured", () => {
      const info = game.config().unitInfo(UnitType.FragBomb);
      expect(info.damage).toBeDefined();
      expect(info.damage!).toBeGreaterThan(0);
    });

    test("ImpulseBomb has damage configured", () => {
      const info = game.config().unitInfo(UnitType.ImpulseBomb);
      expect(info.damage).toBeDefined();
      expect(info.damage!).toBeGreaterThan(0);
    });
  });

  describe("Phase 4 coexistence", () => {
    test("EMP launcher can coexist with other phase units", () => {
      const emp = player1.buildUnit(UnitType.EMPLauncher, game.ref(5, 5), {});
      const tank = player1.buildUnit(UnitType.Tank, game.ref(6, 5), {});
      const radar = player1.buildUnit(UnitType.Radar, game.ref(7, 5), {});
      const bunker = player1.buildUnit(UnitType.Bunker, game.ref(5, 6), {});

      expect(emp.isActive()).toBe(true);
      expect(tank.isActive()).toBe(true);
      expect(radar.isActive()).toBe(true);
      expect(bunker.isActive()).toBe(true);

      for (let i = 0; i < 50; i++) {
        game.executeNextTick();
      }

      expect(emp.isActive()).toBe(true);
      expect(tank.isActive()).toBe(true);
      expect(radar.isActive()).toBe(true);
      expect(bunker.isActive()).toBe(true);
    });
  });
});
