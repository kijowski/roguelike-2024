// export interface Action {
//   kind: string;
// }

export const movement = (x: number, y: number) =>
  ({ kind: "movement", x, y }) as const;

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
