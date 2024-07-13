import { handleInput } from "./input-handler";
import { Entity, spawnPlayer } from "./entity";
import { generateDungeon } from "./procgen";
import { GameMap } from "./map";
import { RenderingEngine } from "./graphics";

export class Engine {
  static readonly Height = 60;
  static readonly Width = 60;
  static readonly MaxEnemiesPerRoom = 3;
  renderingEngine!: RenderingEngine;
  gameMap!: GameMap;
  player!: Entity;

  constructor() {
    this.renderingEngine = new RenderingEngine();
    this.setup();
  }
  async setup() {
    await this.renderingEngine.setup();
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
      this.renderingEngine,
    );

    this.player = spawnPlayer(
      this.gameMap.startingPos.x,
      this.gameMap.startingPos.y,
      this.renderingEngine,
    );

    let lag = 0;
    const MS_PER_UPDATE = (1 / 120) * 1000;
    this.renderingEngine.addTicker((ticker) => {
      const elapsed = ticker.deltaMS;
      // Input is processed in event system
      lag += elapsed;

      while (lag > MS_PER_UPDATE) {
        this.player.update(this);
        // this.handleEnemyTurns();
        this.gameMap.updateFov(this.player);
        this.gameMap.update(this);
        lag -= MS_PER_UPDATE;
      }
      // Rendering step is implicit
      // this.render(lag / MS_PER_UPDATE); // pass lag / MS_PER_UPDATE
    });
  }
  handleEnemyTurns() {
    this.gameMap.nonPlayerEntities.forEach((e) => {
      console.log(
        `The ${e.name} wonders when it will get to take a real turn.`,
      );
    });
  }

  input(ev: KeyboardEvent) {
    const action = handleInput(ev);

    if (action) {
      this.player.actions.push(action);
    } else if (ev.key === "x") {
      localStorage.removeItem("seed");
      window.location.reload();
    }
  }
}
