import { Engine } from "./engine";
import { Entity } from "./entity";

declare global {
  interface Window {
    engine: Engine;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const player = new Entity(1, 0, "@");
  const npc = new Entity(10, 10, "X", "#f0f");
  window.engine = new Engine([player, npc], player);
});
