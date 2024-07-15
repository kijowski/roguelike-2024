import { AnimatedSprite, Sprite, Spritesheet } from "pixi.js";
import { engine } from "./engine";
import { RenderingEngine } from "./graphics";
import { Fighter } from "./components/fighter";
import { BaseAI, HostileEnemy } from "./components/ai";

const MAX_FRAME = 4;

export class Entity {
  public displayX: number;
  public displayY: number;
  // public isMoving = false;
  public frame: number = 0;

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public blocksMovement: boolean,
    private tileScale: number,
    public sprite: Sprite,
  ) {
    this.displayX = this.x;
    this.displayY = this.y;
  }

  render() {
    const diffX = this.x - this.displayX;
    const diffY = this.y - this.displayY;

    // Diagonal
    if (diffX !== 0 && diffY !== 0) {
      this.frame += 1;
      // this.sprite.angle += (22.5 / 1) * Math.sign(diffX);
      this.sprite.angle += (90 / 1) * Math.sign(diffX);
      this.displayX += getPoisitionShift(this.frame) * diffX;
      this.displayY += getPoisitionShift(this.frame) * diffY;
    } else if (diffX !== 0) {
      // console.log(this.isMoving);
      this.frame += 1;
      // this.isMoving += 1;
      // this.sprite.angle += (22.5 / 1) * Math.sign(diffX);
      this.sprite.angle += (90 / MAX_FRAME) * Math.sign(diffX);
      // this.displayX += 0.0625 * Math.sign(diffX);
      this.displayX += getPoisitionShift(this.frame) * diffX;
    } else if (diffY !== 0) {
      // this.isMoving += 1;
      this.frame += 1;
      // this.sprite.angle += (22.5 / 1) * Math.sign(diffY);
      this.sprite.angle += (90 / MAX_FRAME) * Math.sign(diffY);
      // this.displayY += 0.0625 * diffY;
      this.displayY += getPoisitionShift(this.frame) * diffY;
    }
    this.sprite.x = (this.displayX + 0.5) * this.tileScale;
    this.sprite.y = (this.displayY + 0.5) * this.tileScale;
    this.sprite.height = this.tileScale * 1;
    this.sprite.width = this.tileScale * 1;
    if (Math.abs(diffX) < 0.0001) {
      this.displayX = this.x;
    }

    if (Math.abs(diffY) < 0.1) {
      this.displayY = this.y;
    }

    if (this.frame >= MAX_FRAME) {
      this.displayX = this.x;
      this.displayY = this.y;
      this.frame = 0;
    }
  }
}

function getPoisitionShift(_frame: number) {
  return 0.25;
}

export class DisplayComponent {
  sprite: AnimatedSprite;
  constructor(
    private spritesheet: Spritesheet,
    private tileScale: number,
    private isMoving = false,
  ) {
    this.sprite = new AnimatedSprite(this.spritesheet.animations.warrior_0);
    this.sprite.loop = true;
    this.sprite.height = this.tileScale;
    this.sprite.width = this.tileScale;
  }

  update(entity: Entity) {
    const diffX = entity.x - entity.displayX;
    const diffY = entity.y - entity.displayY;

    if (diffX === 0 && diffY === 0 && this.isMoving) {
      this.isMoving = false;
      this.sprite.textures = this.spritesheet.animations.warrior_0;
      this.sprite.play();
    }
    this.isMoving = diffX !== 0 || diffY !== 0;
    if (this.isMoving) {
      this.sprite.textures = this.spritesheet.animations.warrior_2;
      this.sprite.play();
      entity.sprite.scale.x = Math.sign(diffX);
    }

    entity.displayX += 0.0625 * Math.sign(diffX);
    entity.displayY += 0.0625 * Math.sign(diffY);

    this.sprite.x = (entity.displayX + 0.5) * this.tileScale;
    this.sprite.y = (entity.displayY + 0.5) * this.tileScale;
  }
}

export function spawnPlayer(x: number, y: number) {
  const sprite = engine.renderer.getSprite("clasic:141");
  sprite.anchor.set(0.5);
  engine.renderer.add(sprite);
  return new Actor(
    "player",
    x,
    y,
    false,
    RenderingEngine.TileSize,
    sprite,
    null,
    new Fighter(30, 4, 5),
  );
}

export function spawnOrc(x: number, y: number) {
  const sprite = engine.renderer.getSprite("clasic:143");
  sprite.anchor.set(0.5);
  sprite.tint = "#0f0";
  engine.renderer.add(sprite);
  return new Actor(
    "orc",
    x,
    y,
    true,
    RenderingEngine.TileSize,
    sprite,
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
    tileScale: number,
    public sprite: Sprite,
    public ai: BaseAI | null,
    public fighter: Fighter,
  ) {
    super(name, x, y, blocksMovement, tileScale, sprite);
    this.fighter.entity = this;
  }
  get isAlive(): boolean {
    return !!this.ai || engine.player === this;
  }
}
