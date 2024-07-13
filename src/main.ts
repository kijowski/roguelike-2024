import { engine, Engine } from "./engine";
import "./style.css";

declare global {
  interface Window {
    engine: Engine;
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await engine.setup();
  window.engine = engine;
});
