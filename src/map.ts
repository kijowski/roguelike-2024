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

  addRoom(x: number, y: number, tiles: Tile[][]) {
    for (let row = y; row < y + tiles.length; row++) {
      const mapRow = this.tiles[row];
      const roomRow = tiles[row - y];
      for (let col = x; col < x + roomRow.length; col++) {
        mapRow[col] = roomRow[col - x];
      }
    }
  }
}
