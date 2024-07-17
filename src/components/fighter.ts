import { engine } from "../engine";
import { Actor } from "../entity";
import { BaseComponent } from "./base-component";

export class Fighter implements BaseComponent {
  entity: Actor | null;
  #hp: number;

  constructor(
    public maxHp: number,
    public defense: number,
    public power: number,
  ) {
    this.#hp = maxHp;
    this.entity = null;
  }

  get hp() {
    return this.#hp;
  }

  set hp(value: number) {
    this.#hp = Math.max(Math.min(this.maxHp, value));
    if (this.#hp <= 0 && this.entity?.isAlive) {
      this.die();
    }
  }
  die() {
    if (!this.entity) return;

    let deathMessage = "";
    if (window.engine.player === this.entity) {
      deathMessage = "You died!";
    } else {
      deathMessage = `${this.entity.name} is dead!`;
    }

    if (this.entity.ai) {
      for (const tile of this.entity.ai.path) {
        engine.gameMap.tiles[tile.y][tile.x].recolor();
      }
    }

    this.entity.display.sprite.tint = "#bf0000";
    this.entity.display.sprite.alpha = 0.8;
    this.entity.display.sprite.zIndex = -1;
    this.entity.blocksMovement = false;
    this.entity.ai = null;
    this.entity.name = `Remains of ${this.entity.name}`;

    engine.messageLog.addMessage(deathMessage);
  }
}
