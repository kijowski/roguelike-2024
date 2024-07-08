import { Display } from "rot-js";
import { FLOOR, Tile, WALL } from "./graphics";
import { GameMap } from "./map";
import { Entity } from "./entity";

export class RectangularRoom {
  tiles: Tile[][] = [];

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {
    this.buildRoom();
  }

  buildRoom() {
    for (let row = 0; row < this.height; row++) {
      const rowArr = [];
      for (let col = 0; col < this.width; col++) {
        const isWall =
          row === 0 ||
          row === this.height - 1 ||
          col === 0 ||
          col === this.width - 1;
        rowArr.push(isWall ? { ...WALL } : { ...FLOOR });
      }
      this.tiles.push(rowArr);
    }
  }

  getCenter() {
    const centerX = this.x + Math.floor(this.width / 2);
    const centerY = this.y + Math.floor(this.height / 2);
    return [centerX, centerY];
  }

  intersects(other: RectangularRoom) {
    return (
      this.x <= other.x + other.width &&
      this.x + this.width >= other.x &&
      this.y <= other.y + other.height &&
      this.y + this.width >= other.y
    );
  }
}

export function generateDungeon(
  mapWidth: number,
  mapHeight: number,
  maxRooms: number,
  minSize: number,
  maxSize: number,
  player: Entity,
  display: Display,
) {
  const dungeon = new GameMap(mapWidth, mapHeight, display);
  const rooms: RectangularRoom[] = [];

  for (let i = 0; i < maxRooms; i++) {
    const width = generateRandomNumber(minSize, maxSize);
    const height = generateRandomNumber(minSize, maxSize);

    const x = generateRandomNumber(0, mapWidth - width - 1);
    const y = generateRandomNumber(0, mapHeight - height - 1);

    const newRoom = new RectangularRoom(x, y, width, height);
    if (rooms.some((r) => r.intersects(newRoom))) {
      continue;
    }
    dungeon.addRoom(newRoom.x, newRoom.y, newRoom.tiles);
    rooms.push(newRoom);
  }

  const startingPos = rooms[0].getCenter();
  player.x = startingPos[0];
  player.y = startingPos[1];

  for (let i = 0; i < rooms.length - 1; i++) {
    const room1 = rooms[i];
    const room2 = rooms[i + 1];
    for (let tile of connect(room1, room2)) {
      dungeon.tiles[tile[1]][tile[0]] = { ...FLOOR };
    }
  }

  return dungeon;
}

export function* connect(a: RectangularRoom, b: RectangularRoom) {
  let current = a.getCenter();
  const end = b.getCenter();

  while (current[0] !== end[0] || current[1] !== end[1]) {
    const idx = Math.random() > 0.5 ? 0 : 1;
    const delta = Math.sign(end[idx] - current[idx]);
    if (delta !== 0) {
      current[idx] += delta;
      yield current;
    }
  }
}

export function generateRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}
