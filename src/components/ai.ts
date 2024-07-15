import { engine } from "../engine";
import { Actor, Entity } from "../entity";
import { Action, HitAction, WaitAction, WalkAction } from "../input-handler";
import * as rot from "rot-js";

export abstract class BaseAI implements Action {
  path: { x: number; y: number }[] = [];

  abstract perform(entity: Entity): void;

  calculatePathTo(destX: number, destY: number, entity: Entity) {
    const isPassable = (x: number, y: number) => {
      const blocking = engine.gameMap.entityBlockingWay(x, y);
      let blocks = false;
      if (blocking) {
        if (blocking.x === entity.x && blocking.y === entity.y) {
          blocks = false;
        } else {
          blocks = true;
        }
      }

      return engine.gameMap.tiles[y][x].flags.walkable && !blocks;
    };

    for (const item of this.path) {
      engine.gameMap.tiles[item.y][item.x].recolor();
    }

    this.path = [];

    const dijkstra = new rot.Path.Dijkstra(destX, destY, isPassable, {
      topology: 4,
    });

    dijkstra.compute(entity.x, entity.y, (x, y) => this.path.push({ x, y }));
    for (const item of this.path) {
      engine.gameMap.tiles[item.y][item.x].recolor("#f00");
    }
    // this.path.shift();
  }
}

export class HostileEnemy extends BaseAI {
  perform(entity: Entity) {
    const target = engine.player;
    const dx = target.x - entity.x;
    const dy = target.y - entity.y;
    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    if (engine.gameMap.tiles[entity.y][entity.x].flags.visible) {
      if (distance <= 1) {
        return new HitAction(dx, dy).perform(entity as Actor);
      }
      this.calculatePathTo(target.x, target.y, entity);
    }

    if (this.path.length > 1) {
      const { x: destX, y: destY } = this.path[1];
      const ownTile = this.path.shift()!;
      engine.gameMap.tiles[ownTile.y][ownTile.x].recolor();
      return new WalkAction(destX - entity.x, destY - entity.y).perform(entity);
    }

    return new WaitAction().perform(entity);
  }
}
