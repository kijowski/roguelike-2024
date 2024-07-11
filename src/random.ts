import random, { Random } from "random";
import seedrandom from "seedrandom";

type Extra = {
  pick<T>(choices: T[]): T;
  picker<T>(choices: T[]): () => T;
  wpick<T>(choices: { item: T; weight: number }[]): T;
  wpicker<T>(choices: { item: T; weight: number }[]): () => T;
};
type ExtendedRandom = Random & Extra;

export const initRandom = (seed: string | number) => {
  // @ts-ignore
  random.use(seedrandom(seed));
  const extended: ExtendedRandom = Object.assign<Random, Extra>(random, {
    pick: <T>(choices: T[]) => {
      return choices[random.integer(0, choices.length - 1)];
    },
    picker: <T>(choices: T[]) => {
      return () => choices[random.integer(0, choices.length - 1)];
    },

    wpick: <T>(choices: { item: T; weight: number }[]) => {
      let total = 0;
      for (let i = 0; i < choices.length; i++) {
        const entry = choices[i];
        total += entry.weight;
        entry.weight = total;
      }
      const n = random.float(0, total);
      return choices.find(({ weight }) => weight >= n)!.item;
    },
    wpicker: <T>(choices: { item: T; weight: number }[]) => {
      let total = 0;
      for (let i = 0; i < choices.length; i++) {
        const entry = choices[i];
        total += entry.weight;
        entry.weight = total;
      }
      return () => {
        const n = random.float(0, total);
        return choices.find(({ weight }) => weight >= n)!.item;
      };
    },
  });
  return extended;
};

const seed = localStorage.getItem("seed") ?? Date.now().toString();
localStorage.setItem("seed", seed);

export const rng = initRandom(seed);
