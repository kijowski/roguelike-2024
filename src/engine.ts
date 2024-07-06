import * as rot from "rot-js";
import { handleInput } from "./input-handler";

export class Engine {
  display = new rot.Display({
    width: 50,
    height: 50,
    forceSquareRatio: true,
  });

  player = { x: 1, y: 0 };

  constructor() {
    const container = this.display.getContainer()!;
    document.body.appendChild(container);

    window.addEventListener("keydown", (event) => {
      this.update(event);
    });

    this.render();
  }

  render() {
    this.display.draw(this.player.x, this.player.y, "@", "#fff", "#302");
  }

  update(ev: KeyboardEvent) {
    this.display.clear();

    const move = handleInput(ev);

    if (move?.kind === "movement") {
      this.player.x += move.x;
      this.player.y += move.y;
    }

    this.render();
  }
}
