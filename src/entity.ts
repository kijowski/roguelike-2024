export class Entity {
  constructor(
    public x: number,
    public y: number,
    public char: string,
    public fg = "#fff",
    public bg = "#000",
  ) {}

  move({ x, y }: { x: number; y: number }) {
    this.x += x;
    this.y += y;
  }
}
