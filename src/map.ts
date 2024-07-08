import { Display } from "rot-js";
import { FLOOR, Tile, WALL } from "./graphics";

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
        if (colNo > 20 && colNo < 24 && rowNo > 20 && rowNo < 29) {
          row[colNo] = { ...WALL };
        } else {
          row[colNo] = { ...FLOOR };
        }
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
        this.display.draw(
          rowNo,
          colNo,
          tile.glyph.char,
          tile.glyph.fg,
          tile.glyph.bg,
        );
      }
    }
  }
}
class RectangularRoom {
  tiles: Tile[][];
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {
    this.tiles = new Array(height);
  }

  buildRoom() {
    for (let y = 0; y < this.height; y++) {
      const row = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        const isWall =
          x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1;
        row[x] = isWall ? { ...WALL } : { ...FLOOR };
      }
      this.tiles[y] = row;
    }
  }
}
