import { Engine } from "./engine";
import "./style.css";

declare global {
  interface Window {
    engine: Engine;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.engine = new Engine();
});
