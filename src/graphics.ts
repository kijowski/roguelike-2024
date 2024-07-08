export interface Graphics {
  char: string;
  fg: string;
  bg: string;
}

export interface Tile {
  walkable: boolean;
  transparent: boolean;
  glyph: Graphics;
}

export const FLOOR: Tile = {
  walkable: true,
  transparent: true,
  glyph: { char: " ", fg: "$fff", bg: "#000" },
};

export const WALL: Tile = {
  walkable: false,
  transparent: false,
  glyph: { char: " ", fg: "$fff", bg: "#363b37" },
};
