import { Action, handleInput } from "./input-handler";
import { Actor, spawnPlayer } from "./entity";
import { generateDungeon } from "./procgen";
import { GameMap } from "./map";
import { RenderingEngine } from "./graphics";

export class Engine {
  static readonly Height = 60;
  static readonly Width = 60;
  static readonly MaxEnemiesPerRoom = 3;
  renderer!: RenderingEngine;
  gameMap!: GameMap;
  player!: Actor;

  nextAction: Action | null = null;

  constructor() {
    this.renderer = new RenderingEngine();
  }
  async setup() {
    await this.renderer.setup();
    window.addEventListener("keydown", (event) => {
      this.input(event);
    });

    this.gameMap = generateDungeon(
      Engine.Width,
      Engine.Height,
      8,
      4,
      12,
      Engine.MaxEnemiesPerRoom,
    );

    this.player = spawnPlayer(
      this.gameMap.startingPos.x,
      this.gameMap.startingPos.y,
    );
    this.gameMap.entities.push(this.player);
    this.gameMap.updateFov(this.player);

    let lag = 0;
    const MS_PER_UPDATE = (1 / 120) * 1000;
    this.renderer.app.ticker.maxFPS = 120;
    this.renderer.addTicker((ticker) => {
      const elapsed = ticker.deltaMS;
      // Input is processed in event system
      lag += elapsed;

      while (lag > MS_PER_UPDATE) {
        const action = this.nextAction;
        if (action) {
          action.perform(this.player);
          this.gameMap.updateFov(this.player);
          this.nextAction = null;
          this.handleEnemyTurns();
        }
        lag -= MS_PER_UPDATE;
      }
      this.gameMap.render();
      // Rendering step is implicit
      // this.render(lag / MS_PER_UPDATE); // pass lag / MS_PER_UPDATE
    });
  }
  handleEnemyTurns() {
    this.gameMap.actors.forEach((e) => {
      e.ai?.perform(e);
    });
  }

  input(ev: KeyboardEvent) {
    const action = handleInput(ev);

    if (action) {
      if (this.player.fighter.hp > 0) {
        if (!this.nextAction) {
          this.nextAction = action;
        }
      }
    } else if (ev.key === "o") {
      localStorage.removeItem("seed");
      window.location.reload();
    } else if (ev.key === "k") {
      this.renderer.screenShake();
    } else if (ev.key === "l") {
      this.renderer.bounce();
    } else if (ev.key === ";") {
      // this.renderer.roll();
      this.renderer.roll(500, Math.PI * 6);
    }
  }
}

export const engine = new Engine();
