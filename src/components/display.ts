import { Sprite } from "pixi.js";
import { RenderingEngine } from "../graphics";

export class DisplayComponent {
  constructor(
    public sprite: Sprite,
    public displayX: number,
    public displayY: number,
    private tileSize = RenderingEngine.TileSize,
    private shiftAmount = 0.25,
  ) {
    this.size = { height: 1, width: 1 };
  }

  set size({ width, height }: { width?: number; height?: number }) {
    if (width) this.sprite.width = Math.max(this.tileSize * width, 0.1);
    if (height) this.sprite.height = Math.max(this.tileSize * height, 0.1);
  }

  render(x: number, y: number) {
    const diffX = x - this.displayX;
    const diffY = y - this.displayY;

    if (diffX !== 0 && diffY !== 0) {
      // Diagonal
      this.displayX += this.shiftAmount * diffX;
      this.displayY += this.shiftAmount * diffY;
      this.sprite.skew.x =
        (Math.PI / 8) * Math.sign(diffX) * Math.abs(diffX) * 2;

      // this.size = {
      //   width: 1 + 0.6 * Math.abs(diffX),
      //   height: 1 - 0.6 * Math.abs(diffY),
      // };
    } else if (diffX !== 0) {
      // Horizontal
      this.displayX += this.shiftAmount * diffX;

      this.sprite.skew.x =
        (Math.PI / 8) * Math.sign(diffX) * Math.abs(diffX) * 2;
      // this.size = {
      //   width: 1 + Math.abs(diffX),
      //   height: 1 - 0.5 * Math.abs(diffX),
      // };
    } else if (diffY !== 0) {
      // Vertical
      this.displayY += this.shiftAmount * diffY;

      // this.sprite.skew.x =
      //   (Math.PI / 8) * Math.sign(diffY) * Math.abs(diffY) * 2;

      // this.sprite.skew.y =
      //   (Math.PI / 8) * Math.sign(diffY) * Math.abs(diffY) * 2;

      this.size = {
        width: 1 - 0.5 * Math.abs(diffY),
        height: 1 + Math.abs(diffY),
      };
    }

    this.sprite.x = (this.displayX + 0.5) * this.tileSize;
    this.sprite.y = (this.displayY + 0.5) * this.tileSize;

    if (Math.abs(diffX) > 0 && Math.abs(diffX) < 0.01) {
      this.displayX = x;
      this.size = { width: 1, height: 1 };

      this.sprite.skew.x = 0;
    }

    if (Math.abs(diffY) > 0 && Math.abs(diffY) < 0.01) {
      this.displayY = y;
      this.size = { width: 1, height: 1 };
    }
  }
}
