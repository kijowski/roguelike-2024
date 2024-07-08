import * as rot from "rot-js";
import { handleInput } from "./input-handler";
import { Entity } from "./entity";
import { generateDungeon } from "./procgen";
import { GameMap } from "./map";

export class Engine {
  static readonly Height = 50;
  static readonly Width = 50;
  gameMap: GameMap;

  display = new rot.Display({
    width: Engine.Width,
    height: Engine.Height,
    forceSquareRatio: true,
  });

  constructor(
    private entities: Entity[],
    private player: Entity,
  ) {
    const container = this.display.getContainer()!;
    document.body.appendChild(container);

    window.addEventListener("keydown", (event) => {
      this.update(event);
    });

    this.gameMap = generateDungeon(
      Engine.Width,
      Engine.Height,
      8,
      4,
      12,
      this.player,
      this.display,
    );

    this.render();
  }

  update(ev: KeyboardEvent) {
    this.display.clear();
    const action = handleInput(ev);

    if (action) {
      action.perform(this, this.player);
    }

    this.gameMap.updateFov(this.player);
    this.render();
  }

  render() {
    this.gameMap.render();

    for (const entity of this.entities) {
      this.display.draw(entity.x, entity.y, entity.char, entity.fg, entity.bg);
    }
  }
}
