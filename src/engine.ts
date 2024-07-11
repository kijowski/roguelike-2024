import { handleInput } from "./input-handler";
import { Entity } from "./entity";
import { generateDungeon } from "./procgen";
import { GameMap } from "./map";
import { RenderingEngine } from "./graphics";

export class Engine {
  static readonly Height = 60;
  static readonly Width = 60;
  renderingEngine!: RenderingEngine;
  gameMap!: GameMap;
  entities!: Entity[];
  player!: Entity;

  constructor() {
    this.renderingEngine = new RenderingEngine();
    this.setup();
  }
  async setup() {
    await this.renderingEngine.setup();
    this.entities = [];
    window.addEventListener("keydown", (event) => {
      this.input(event);
    });

    this.gameMap = generateDungeon(
      Engine.Width,
      Engine.Height,
      8,
      4,
      12,
      this.renderingEngine,
    );

    this.player = new Entity(
      this.gameMap.startingPos.x,
      this.gameMap.startingPos.y,
      RenderingEngine.TileSize,
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
        this.gameMap.updateFov(this.player);
        this.gameMap.render();
        lag -= MS_PER_UPDATE;
      }
      // Rendering step is implicit
      // this.render(lag / MS_PER_UPDATE); // pass lag / MS_PER_UPDATE
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
