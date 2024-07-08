import { Display, FOV } from "rot-js";
import { Tile, WALL } from "./graphics";
import { Entity } from "./entity";

export class GameMap {
  tiles: Tile[][] = new Array(this.height);

  constructor(
    public width: number,
    public height: number,
    private display: Display,
  ) {
    for (let rowNo = 0; rowNo < height; rowNo++) {
      const row = new Array(width);
      for (let colNo = 0; colNo < width; colNo++) {
        row[colNo] = { ...WALL };
      }
      this.tiles[rowNo] = row;
    }
  }

  isInBounds({ x, y }: { x: number; y: number }) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  render() {
    for (let rowNo = 0; rowNo < this.height; rowNo++) {
      for (let colNo = 0; colNo < this.width; colNo++) {
        const tile = this.tiles[colNo][rowNo];
        if (tile.visible) {
          this.display.draw(
            rowNo,
            colNo,
            tile.light.char,
            tile.light.fg,
            tile.light.bg,
          );
        } else {
          this.display.draw(
            rowNo,
            colNo,
            tile.dark.char,
            tile.dark.fg,
            tile.dark.bg,
          );
        }
      }
    }
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
    return this.tiles[y][x].transparent;
  }

  updateFov(player: Entity) {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.tiles[row][col].visible = false;
      }
    }

    const fov = new FOV.PreciseShadowcasting(this.lightPasses.bind(this));
    fov.compute(player.x, player.y, 8, (x, y, _r, visiblity) => {
      if (visiblity === 1) {
        this.tiles[y][x].visible = true;
        this.tiles[y][x].seen = true;
      }
    });
  }
}
