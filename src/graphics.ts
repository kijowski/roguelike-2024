import {
  Application,
  Assets,
  BitmapText,
  Container,
  Dict,
  Sprite,
  Spritesheet,
  SpritesheetData,
  SpritesheetFrameData,
  Texture,
  TextureStyle,
  TickerCallback,
} from "pixi.js";
import { rng } from "./random";
import { engine } from "./engine";

export interface TileFlags {
  walkable: boolean;
  transparent: boolean;
  visible: boolean;
  seen: boolean;
}

export class Tile {
  private baseAlpha: number;
  private colorOverride: string | null;
  constructor(
    public flags: TileFlags,
    private colors: { light: string; dark: string; tint: string },
    private sprite: Container,
    baseAlpha = 0.1,
  ) {
    this.sprite.width = RenderingEngine.TileSize;
    this.sprite.height = RenderingEngine.TileSize;
    this.sprite.tint = this.colors.light;
    this.sprite.alpha = this.baseAlpha = baseAlpha + rng.float(0, 0.2);
    this.sprite.visible = false;
    this.colorOverride = null;
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
    if (this.colorOverride) {
      this.sprite.tint = this.colorOverride;
      // this.colorOverride = null;
    } else {
      this.sprite.tint = this.colors.light;
    }
  }

  recolor(colorOverride?: string) {
    this.colorOverride = colorOverride ?? null;
  }
}

export class RenderingEngine {
  static readonly TileSize = 16;
  static knownTiles = ["floor", "wall"] as const;

  app!: Application;
  spriteSheet!: Spritesheet;

  background!: Container;
  entities!: Container;
  corpses!: Container;

  async setup() {
    this.app = new Application();
    await this.app.init({
      width: 960,
      height: 960,
      antialias: false,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      background: "#061b27",
    });

    this.background = new Container();
    this.entities = new Container();
    this.corpses = new Container();

    this.app.stage.addChild(this.background);
    this.app.stage.addChild(this.entities);
    this.app.stage.addChild(this.entities);

    document.body.appendChild(this.app.canvas);

    TextureStyle.defaultOptions.scaleMode = "nearest";

    await Assets.load("classic_roguelike_white.png");
    const texture = Texture.from("classic_roguelike_white.png");

    this.spriteSheet = new Spritesheet(texture, parseClasic("clasic"));
    await this.spriteSheet.parse();

    await Assets.load([
      "CozetteMini/CozetteMini.png",
      "CozetteMini/CozetteMini.xml",
    ]);

  }

  add(sprite: Container) {
    this.entities.addChild(sprite);
  }

  remove(sprite: Container) {
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
    let sprite: Container;
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
        this.background.addChild(sprite);
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
        this.background.addChild(sprite);
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

  screenShake(duration = 500, size = 10) {
    let totalDuration = 0;
    let toDelete = false;
    const shaking = this.app.stage;
    // const shaking = this.background;
    const cb: TickerCallback<any> = (ticker) => {
      const elapsed = ticker.deltaMS;
      totalDuration += elapsed;
      if (toDelete) {
        this.app.ticker.remove(cb);
      }
      if (totalDuration >= duration) {
        shaking.updateTransform({
          x: 0,
          y: 0,
        });
        toDelete = true;
        return;
      }

      shaking.updateTransform({
        x: rng.int(-size, size),
        y: rng.int(-size, size),
      });
    };
    this.app.ticker.add(cb);
  }

  bounce(duration = 200, size = 1000) {
    let totalDuration = 0;
    let toDelete = false;
    const shaking = this.app.stage;
    // const shaking = this.background;
    // shaking.pivot = 0.5;

    const cb: TickerCallback<any> = (ticker) => {
      const elapsed = ticker.deltaMS;
      totalDuration += elapsed;
      if (toDelete) {
        this.app.ticker.remove(cb);
      }
      let percentDone = totalDuration / duration;
      if (percentDone > 0.5) percentDone = 1 - percentDone;
      if (totalDuration >= duration) {
        // this.app.stage.x = 0;
        // this.app.stage.y = 0;
        shaking.updateTransform({
          y: 0,
        });
        // shaking.
        toDelete = true;
        return;
      }

      shaking.updateTransform({
        y: shaking.x + percentDone * size, //rng.float(-size, size),
      });
    };
    this.app.ticker.add(cb);
  }

  roll(duration = 500, amount = Math.PI * 2) {
    let totalDuration = 0;
    let toDelete = false;
    const shaking = this.app.stage;
    // const shaking = this.background;
    shaking.pivot = { x: 1200 / 2, y: 960 / 2 };

    const cb: TickerCallback<any> = (ticker) => {
      const elapsed = ticker.deltaMS;
      totalDuration += elapsed;
      if (toDelete) {
        this.app.ticker.remove(cb);
      }
      const percentDone = totalDuration / duration;
      if (totalDuration >= duration) {
        // this.app.stage.x = 0;
        // this.app.stage.y = 0;
        shaking.updateTransform({
          rotation: 0,
          // scaleX: 1,
          // scaleY: 1,
          pivotX: 0,
          pivotY: 0,
          x: 0,
          y: 0,
        });
        // shaking.
        toDelete = true;
        return;
      }

      shaking.updateTransform({
        rotation: percentDone * amount,
        x: 600,
        y: 480,
        // scaleX: 1 - percentDone,
        // scaleY: 1 - percentDone,

        // y: shaking.x + percentDone * size, //rng.float(-size, size),
        // scaleY: 1 + rng.float(-size, size),
      });
    };
    this.app.ticker.add(cb);
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
      };
    }
    // animations[`${name}_${row}`] = frameNames;
  }

  return { meta, frames };
}
