import { FOV } from "rot-js";
import { Tile } from "./graphics";
import { Actor, Entity } from "./entity";
import { engine } from "./engine";

export class GameMap {
  tiles: Tile[][] = new Array(this.height);
  startingPos: { x: number; y: number };
  entities: Entity[];

  constructor(
    public width: number,
    public height: number,
  ) {
    this.startingPos = { x: 0, y: 0 };
    this.entities = [];
    for (let rowNo = 0; rowNo < height; rowNo++) {
      const row = new Array(width);
      for (let colNo = 0; colNo < width; colNo++) {
        row[colNo] = engine.renderer.getTile("wall");
      }
      this.tiles[rowNo] = row;
    }
  }

  isInBounds({ x, y }: { x: number; y: number }) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  render() {
    for (const [rowNo, row] of this.tiles.entries()) {
      for (const [colNo, tile] of row.entries()) {
        tile.render(rowNo, colNo);
      }
    }
    for (const entity of this.entities) {
      entity.display.sprite.visible =
        this.tiles[entity.y][entity.x].flags.visible;
      entity.render();
    }
  }

  setStartingPos(x: number, y: number) {
    this.startingPos = { x, y };
  }

  addRoom(x: number, y: number, tiles: Tile[][]) {
    for (let row = y; row < y + tiles.length; row++) {
      const mapRow = this.tiles[row];
      const roomRow = tiles[row - y];
      for (let col = x; col < x + roomRow.length; col++) {
        mapRow[col] = roomRow[col - x];
      }
    }
  }

  lightPasses(x: number, y: number) {
    if (!this.isInBounds({ x, y })) {
      return false;
    }
    return this.tiles[y][x].flags.transparent;
  }

  entityBlockingWay(x: number, y: number) {
    if (!this.isInBounds({ x, y })) {
      return false;
    }
    return this.entities.find(
      (entity) => entity.x === x && entity.y === y && entity.blocksMovement,
    );
  }

  public get nonPlayerEntities(): Entity[] {
    return this.entities.filter((e) => e.name !== "player");
  }

  getActorAtLocation(x: number, y: number): Actor | undefined {
    return this.actors.find((a) => a.x === x && a.y === y);
  }

  public get actors(): Actor[] {
    return this.entities
      .filter((e) => e instanceof Actor)
      .map((e) => e as Actor)
      .filter((e) => e.isAlive);
  }

  updateFov(player: Entity) {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.tiles[row][col].flags.visible = false;
      }
    }

    const fov = new FOV.PreciseShadowcasting(this.lightPasses.bind(this));
    fov.compute(player.x, player.y, 8, (x, y, _r, visiblity) => {
      if (visiblity === 1) {
        this.tiles[y][x].flags.visible = true;
        this.tiles[y][x].flags.seen = true;
      }
    });
  }
}
