import { AnimatedSprite, Sprite, Spritesheet } from "pixi.js";
import { Action } from "./input-handler";
import { Engine } from "./engine";
import { RenderingEngine } from "./graphics";

export class Entity {
  public displayX: number;
  public displayY: number;
  public isMoving = false;
  public actions: Action[];

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
    this.actions = [];
  }

  update(engine: Engine) {
    const action = this.actions.pop();
    if (action) {
      action.perform(engine, this);
    }

    const diffX = this.x - this.displayX;
    const diffY = this.y - this.displayY;
    if (diffX !== 0) {
      this.isMoving = true;
      this.sprite.angle += (22.5 / 2) * Math.sign(diffX);
      this.displayX += 0.0625 * Math.sign(diffX);
    }
    if (diffY !== 0) {
      this.isMoving = true;
      this.sprite.angle += (22.5 / 2) * Math.sign(diffY);
      this.displayY += 0.0625 * Math.sign(diffY);
    }
    this.sprite.x = (this.displayX + 0.5) * this.tileScale;
    this.sprite.y = (this.displayY + 0.5) * this.tileScale;
    this.sprite.height = this.tileScale * 1;
    this.sprite.width = this.tileScale * 1;
    if (diffX === 0 && diffY === 0 && this.isMoving) {
      this.isMoving = false;
    }
  }
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

export function spawnPlayer(x: number, y: number, renderer: RenderingEngine) {
  const sprite = renderer.getSprite("clasic:141");
  sprite.anchor.set(0.5);
  renderer.add(sprite);
  return new Entity("player", x, y, false, RenderingEngine.TileSize, sprite);
}

export function spawnOrc(x: number, y: number, renderer: RenderingEngine) {
  const sprite = renderer.getSprite("clasic:143");
  sprite.anchor.set(0.5);
  sprite.tint = "#0f0";
  renderer.add(sprite);
  return new Entity("orc", x, y, true, RenderingEngine.TileSize, sprite);
}
