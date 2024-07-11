import { Engine } from "./engine";
import { Entity } from "./entity";

export interface Action {
  perform: (engine: Engine, entity: Entity) => void;
}

class WalkAction implements Action {
  constructor(
    private dx: number,
    private dy: number,
  ) {}

  perform(engine: Engine, entity: Entity) {
    const { dx, dy } = this;
    const nextx = entity.x + this.dx;
    const nexty = entity.y + this.dy;

    const outOfBounds = !engine.gameMap.isInBounds({ x: nextx, y: nexty });
    const hitsWall = !engine.gameMap.tiles[nexty][nextx].flags.walkable;
    if (outOfBounds || hitsWall) {
      if (!entity.isMoving) {
        entity.displayX += dx / 2;
        entity.displayY += dy / 2;
      }
      return;
    }

    if (!entity.isMoving) {
      entity.x += dx;
      entity.y += dy;
    }
  }
}

const movements: Record<string, Action> = {
  a: new WalkAction(-1, 0),
  d: new WalkAction(1, 0),
  w: new WalkAction(0, -1),
  s: new WalkAction(0, 1),
};

export function handleInput(ev: KeyboardEvent) {
  return movements[ev.key];
}
