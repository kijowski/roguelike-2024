import { engine } from "./engine";
import { Fighter } from "./components/fighter";
import { BaseAI, HostileEnemy } from "./components/ai";
import { DisplayComponent } from "./components/display";

export class Entity {
  constructor(
    public name: string,
    public x: number,
    public y: number,
    public blocksMovement: boolean,
    public display: DisplayComponent,
  ) {}

  render() {
    this.display.render(this.x, this.y);
  }
}

export function spawnPlayer(x: number, y: number) {
  const sprite = engine.renderer.getSprite("clasic:141");
  sprite.anchor.set(0.5);
  engine.renderer.add(sprite);
  const displayComponent = new DisplayComponent(sprite, x, y);
  return new Actor(
    "player",
    x,
    y,
    false,
    displayComponent,
    null,
    new Fighter(30, 4, 5),
  );
}

export function spawnOrc(x: number, y: number) {
  const sprite = engine.renderer.getSprite("clasic:143");
  sprite.anchor.set(0.5);
  sprite.tint = "#0f0";
  engine.renderer.add(sprite);

  const displayComponent = new DisplayComponent(sprite, x, y);
  return new Actor(
    "orc",
    x,
    y,
    true,
    displayComponent,
    new HostileEnemy(),
    new Fighter(10, 2, 8),
  );
}

export class Actor extends Entity {
  constructor(
    public name: string,
    public x: number,
    public y: number,
    public blocksMovement: boolean,
    // tileScale: number,
    public display: DisplayComponent,
    public ai: BaseAI | null,
    public fighter: Fighter,
  ) {
    super(name, x, y, blocksMovement, display);
    this.fighter.entity = this;
  }
  get isAlive(): boolean {
    return !!this.ai || engine.player === this;
  }
}
