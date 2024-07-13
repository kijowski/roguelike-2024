import { Engine } from "./engine";
import { Entity } from "./entity";

export interface Action {
  perform: (engine: Engine, entity: Entity) => void;
}

abstract class MovementAction implements Action {
  constructor(
    protected dx: number,
    protected dy: number,
  ) {}

  abstract perform(engine: Engine, entity: Entity): void;
}

class WalkAction extends MovementAction {
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

class HitAction extends MovementAction {
  perform(engine: Engine, entity: Entity) {
    const { dx, dy } = this;
    const nextx = entity.x + this.dx;
    const nexty = entity.y + this.dy;

    const target = engine.gameMap.entityBlockingWay(nextx, nexty);

    if (!target) {
      return;
    }

    if (!entity.isMoving) {
      entity.displayX += dx / 2;
      entity.displayY += dy / 2;
    }
    console.log(`You hit ${target.name}`);
  }
}

class BumpAction extends MovementAction {
  perform(engine: Engine, entity: Entity) {
    const { dx, dy } = this;
    const nextx = entity.x + this.dx;
    const nexty = entity.y + this.dy;

    if (engine.gameMap.entityBlockingWay(nextx, nexty)) {
      return new HitAction(dx, dy).perform(engine, entity);
    } else {
      return new WalkAction(dx, dy).perform(engine, entity);
    }
  }
}

const movements: Record<string, Action> = {
  a: new BumpAction(-1, 0),
  d: new BumpAction(1, 0),
  w: new BumpAction(0, -1),
  s: new BumpAction(0, 1),
};

export function handleInput(ev: KeyboardEvent) {
  return movements[ev.key];
}
