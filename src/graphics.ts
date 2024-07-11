import {
  Application,
  Assets,
  Dict,
  Sprite,
  Spritesheet,
  SpritesheetData,
  SpritesheetFrameData,
  Texture,
  TickerCallback,
} from "pixi.js";
import { rng } from "./random";

export interface TileFlags {
  walkable: boolean;
  transparent: boolean;
  visible: boolean;
  seen: boolean;
}

export class Tile {
  private baseAlpha: number;
  constructor(
    public flags: TileFlags,
    private colors: { light: string; dark: string; tint: string },
    private sprite: Sprite,
    baseAlpha = 0.1,
  ) {
    this.sprite.width = RenderingEngine.TileSize;
    this.sprite.height = RenderingEngine.TileSize;
    this.sprite.tint = this.colors.light;
    this.sprite.alpha = this.baseAlpha = baseAlpha + rng.float(0, 0.2);
    this.sprite.visible = false;
  }

  render(y: number, x: number) {
    this.sprite.x = x * RenderingEngine.TileSize;
    this.sprite.y = y * RenderingEngine.TileSize;
    if (this.flags.seen) {
      this.sprite.visible = true;
    }
    if (this.flags.visible) {
      this.sprite.alpha = this.baseAlpha + 0.7;
    } else {
      this.sprite.alpha = this.baseAlpha;
    }
  }
}

export class RenderingEngine {
  static readonly TileSize = 16;
  static knownTiles = ["floor", "wall"] as const;

  app!: Application;
  spriteSheet!: Spritesheet;

  async setup() {
    this.app = new Application();
    await this.app.init({
      // resizeTo: window,
      width: 960,
      height: 960,
      antialias: false,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      background: "#061b27",
    });
    document.body.appendChild(this.app.canvas);

    await Assets.load("classic_roguelike_white.png");
    const texture = Texture.from("classic_roguelike_white.png");
    texture.source.style.scaleMode = "nearest";

    this.spriteSheet = new Spritesheet(texture, parseClasic("clasic"));
    await this.spriteSheet.parse();

    // let lag = 0;
    // const MS_PER_UPDATE = (1 / 60) * 1000;
    // this.app.ticker.add((ticker) => {
    //   const elapsed = ticker.deltaMS;
    //   // processInput
    //   lag += elapsed;

    //   while (lag > MS_PER_UPDATE) {
    //     this.player.update(this);
    //     this.gameMap.updateFov(this.player);
    //     lag -= MS_PER_UPDATE;
    //   }
    //   this.render(lag / MS_PER_UPDATE); // pass lag / MS_PER_UPDATE
    // });
  }

  add(sprite: Sprite) {
    this.app.stage.addChild(sprite);
  }

  remove(sprite: Sprite) {
    this.app.stage.removeChild(sprite);
  }

  getSprite(name: string) {
    const sprite = new Sprite(this.spriteSheet.textures[name]);
    sprite.width = RenderingEngine.TileSize;
    sprite.height = RenderingEngine.TileSize;
    return sprite;
  }

  addTicker<T>(cb: TickerCallback<T>) {
    this.app.ticker.add(cb);
  }

  getTile(name: (typeof RenderingEngine.knownTiles)[number]) {
    let sprite: Sprite;
    switch (name) {
      case "floor":
        const tile = rng.wpick([
          { item: 64, weight: 5 },
          { item: 65, weight: 1 },
          { item: 66, weight: 1 },
          { item: 67, weight: 1 },
          { item: 68, weight: 1 },
        ]);
        sprite = this.getSprite(`clasic:${tile}`);
        this.add(sprite);
        return new Tile(
          {
            seen: false,
            transparent: true,
            visible: false,
            walkable: true,
          },
          { dark: "#161b17", light: "#585452", tint: "#fff" },
          sprite,
        );
      case "wall":
        sprite = this.getSprite(`clasic:56`);
        this.add(sprite);
        return new Tile(
          {
            seen: false,
            transparent: false,
            visible: false,
            walkable: false,
          },
          { dark: "#161b17", light: "#bf6010", tint: "#ff1010" },
          sprite,
          0.5,
        );
    }
  }
}

function parseClasic(name: string): SpritesheetData {
  const meta = { size: { w: 224, h: 64 }, scale: 2 };
  const frames: Dict<SpritesheetFrameData> = {};
  // const animations: Dict<string[]> = {};
  for (let row = 0; row < 8; row++) {
    const frameNames = [];
    for (let col = 0; col < 28; col++) {
      const frameName = `${name}:${row * 28 + col}`;
      frameNames.push(frameName);
      frames[frameName] = {
        frame: { x: col * 8, y: row * 8, h: 8, w: 8 },
        sourceSize: { w: 8, h: 8 },
        spriteSourceSize: { x: 0, y: 0, w: 8, h: 8 },
        // anchor: { x: 0.5, y: 0.5 },
        // anchor: { x: col * 48 + 24, y: row * 48 + 24 },
      };
    }
    // animations[`${name}_${row}`] = frameNames;
  }

  return { meta, frames };
}
