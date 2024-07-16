import { engine } from "./engine";
import { Actor, Entity } from "./entity";

export interface Action {
  perform: (entity: Entity) => void;
}

abstract class MovementAction implements Action {
  constructor(
    protected dx: number,
    protected dy: number,
  ) {}

  abstract perform(entity: Entity): void;
}

export class WalkAction extends MovementAction {
  perform(entity: Entity) {
    const { dx, dy } = this;
    const nextx = entity.x + this.dx;
    const nexty = entity.y + this.dy;

    const outOfBounds = !engine.gameMap.isInBounds({ x: nextx, y: nexty });
    const hitsWall = !engine.gameMap.tiles[nexty][nextx].flags.walkable;
    if (outOfBounds || hitsWall) {
      entity.display.displayX += dx / 2;
      entity.display.displayY += dy / 2;
      return;
    }

    entity.display.displayX += dx / 2;
    entity.display.displayY += dy / 2;
    entity.x += dx;
    entity.y += dy;
    // entity.display.angle += 90 * dx + 90 * dy;
  }
}

export class HitAction extends MovementAction {
  perform(entity: Actor) {
    const { dx, dy } = this;
    const nextx = entity.x + this.dx;
    const nexty = entity.y + this.dy;

    const target = engine.gameMap.getActorAtLocation(nextx, nexty);

    if (!target) {
      return;
    }

    const damage = entity.fighter.power - target.fighter.defense;
    const attackDescription = `${entity.name.toUpperCase()} attacks ${
      target.name
    }`;

    if (damage > 0) {
      console.log(`${attackDescription} for ${damage} hit points.`);
      target.fighter.hp -= damage;
    } else {
      console.log(`${attackDescription} but does no damage.`);
    }

    entity.display.displayX += dx / 2;
    entity.display.displayY += dy / 2;

    engine.renderer.screenShake(100, 2);
  }
}

class BumpAction extends MovementAction {
  perform(entity: Entity) {
    const { dx, dy } = this;
    const nextx = entity.x + this.dx;
    const nexty = entity.y + this.dy;

    if (engine.gameMap.getActorAtLocation(nextx, nexty)) {
      return new HitAction(dx, dy).perform(entity as Actor);
    } else {
      return new WalkAction(dx, dy).perform(entity);
    }
  }
}

export class WaitAction implements Action {
  perform(_entity: Entity) {}
}

const movements: Record<string, Action> = {
  q: new BumpAction(-1, -1),
  w: new BumpAction(0, -1),
  e: new BumpAction(1, -1),
  a: new BumpAction(-1, 0),
  s: new WaitAction(),
  d: new BumpAction(1, 0),
  z: new BumpAction(-1, 1),
  x: new BumpAction(0, 1),
  c: new BumpAction(1, 1),
};

export function handleInput(ev: KeyboardEvent) {
  return movements[ev.key];
}
