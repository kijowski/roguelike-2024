export interface Graphics {
  char: string;
  fg: string;
  bg: string;
}

export interface Tile {
  walkable: boolean;
  transparent: boolean;
  visible: boolean;
  seen: boolean;
  dark: Graphics;
  light: Graphics;
}

export const FLOOR: Tile = {
  walkable: true,
  transparent: true,
  visible: false,
  seen: false,
  dark: { char: " ", fg: "$fff", bg: "#000" },
  light: { char: " ", fg: "$fff", bg: "#c8b432" },
};

export const WALL: Tile = {
  walkable: false,
  transparent: false,
  visible: false,
  seen: false,
  dark: { char: " ", fg: "$fff", bg: "#363b37" },
  light: { char: " ", fg: "$fff", bg: "#826e32" },
};
