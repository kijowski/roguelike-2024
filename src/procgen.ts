import { engine } from "./engine";
import { spawnOrc } from "./entity";
import { Tile } from "./graphics";
import { GameMap } from "./map";
import { rng } from "./random";

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
        rowArr.push(
          isWall
            ? engine.renderer.getTile("wall")
            : engine.renderer.getTile("floor"),
        );
      }
      this.tiles.push(rowArr);
    }
  }

  getCenter() {
    const centerX = this.x + Math.floor(this.width / 2);
    const centerY = this.y + Math.floor(this.height / 2);
    return [centerX, centerY];
  }

  getBounds() {
    return {
      x1: this.x,
      y1: this.y,
      x2: this.x + this.width,
      y2: this.y + this.height,
    };
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
  maxMonstersPerRoom: number,
) {
  const dungeon = new GameMap(mapWidth, mapHeight);
  const rooms: RectangularRoom[] = [];

  for (let i = 0; i < maxRooms; i++) {
    const width = rng.int(minSize, maxSize);
    const height = rng.int(minSize, maxSize);

    const x = rng.int(0, mapWidth - width - 1);
    const y = rng.int(0, mapHeight - height - 1);

    const newRoom = new RectangularRoom(x, y, width, height);
    if (rooms.some((r) => r.intersects(newRoom))) {
      continue;
    }
    dungeon.addRoom(newRoom.x, newRoom.y, newRoom.tiles);
    placeEntitties(newRoom, dungeon, maxMonstersPerRoom);
    rooms.push(newRoom);
  }

  const startingPos = rooms[0].getCenter();
  dungeon.setStartingPos(startingPos[0], startingPos[1]);

  for (let i = 0; i < rooms.length - 1; i++) {
    const room1 = rooms[i];
    const room2 = rooms[i + 1];
    for (let tile of connect(room1, room2)) {
      dungeon.tiles[tile[1]][tile[0]] = engine.renderer.getTile("floor");
    }
  }

  return dungeon;
}

export function* connect(a: RectangularRoom, b: RectangularRoom) {
  let current = a.getCenter();
  const end = b.getCenter();

  while (current[0] !== end[0] || current[1] !== end[1]) {
    const idx = rng.bool() ? 0 : 1;
    const delta = Math.sign(end[idx] - current[idx]);
    if (delta !== 0) {
      current[idx] += delta;
      yield current;
    }
  }
}

function placeEntitties(
  room: RectangularRoom,
  dungeon: GameMap,
  maxMonsters: number,
) {
  const monstersNo = rng.int(0, maxMonsters);
  for (let i = 0; i < monstersNo; i++) {
    const bounds = room.getBounds();
    const x = rng.int(bounds.x1 + 1, bounds.x2 - 2);
    const y = rng.int(bounds.y1 + 1, bounds.y2 - 2);
    if (!dungeon.entities.find((entity) => entity.x === x && entity.y === y)) {
      dungeon.entities.push(spawnOrc(x, y));
    }
  }
}
