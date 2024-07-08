// export interface Action {
//   kind: string;
// }

import { Engine } from "./engine";
import { Entity } from "./entity";

export const movement = (x: number, y: number) =>
  ({
    kind: "movement",
    x,
    y,
    perform(engine: Engine, entity: Entity) {
      const x = entity.x + this.x;
      const y = entity.y + this.y;

      if (!engine.gameMap.isInBounds({ x, y })) return;
      if (!engine.gameMap.tiles[y][x].walkable) return;
      entity.move(this);
    },
  }) as const;

export type Action = ReturnType<typeof movement>;

const movements: Record<string, Action> = {
  ArrowUp: movement(0, -1),
  ArrowDown: movement(0, 1),
  ArrowRight: movement(1, 0),
  ArrowLeft: movement(-1, 0),
};

export function handleInput(ev: KeyboardEvent) {
  return movements[ev.key];
}
