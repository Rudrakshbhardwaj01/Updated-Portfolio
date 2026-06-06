import { writeFileSync } from "node:fs";

const U = 4;
const ORANGE = "#FA5200";
const ORANGE_DEEP = "#D94400";
const WIRE = "#FFEBD6";
const px = (value) => value * U;

const letters = [
  {
    offset: 0,
    blocks: [
      { x: 0, y: 0, w: 11, h: 2 },
      { x: 0, y: 2, w: 3, h: 2 },
      { x: 0, y: 4, w: 3, h: 2 },
      { x: 0, y: 6, w: 3, h: 2 },
      { x: 0, y: 8, w: 3, h: 2 },
      { x: 0, y: 10, w: 3, h: 2 },
      { x: 0, y: 12, w: 3, h: 2 },
      { x: 0, y: 14, w: 3, h: 2, deep: true },
      { x: 8, y: 0, w: 4, h: 2 },
      { x: 9, y: 2, w: 3, h: 2 },
      { x: 8, y: 4, w: 5, h: 2 },
      { x: 10, y: 6, w: 3, h: 2 },
      { x: 11, y: 8, w: 2, h: 2 },
      { x: 12, y: 10, w: 2, h: 2 },
      { x: 13, y: 12, w: 2, h: 2 },
      { x: 14, y: 14, w: 2, h: 2, deep: true },
      { x: 3, y: 2, w: 5, h: 2 },
      { x: 3, y: 10, w: 4, h: 2 },
    ],
    traces: [
      { x1: 1, y1: 1, x2: 10, y2: 1 },
      { x1: 1, y1: 1, x2: 1, y2: 14 },
      { x1: 9, y1: 1, x2: 9, y2: 5 },
      { x1: 9, y1: 5, x2: 12, y2: 5 },
      { x1: 12, y1: 5, x2: 12, y2: 9 },
      { x1: 12, y1: 9, x2: 15, y2: 15 },
      { x1: 4, y1: 3, x2: 7, y2: 3 },
      { x1: 4, y1: 11, x2: 6, y2: 11 },
    ],
  },
  {
    offset: 18,
    blocks: [
      { x: 0, y: 0, w: 3, h: 2 },
      { x: 0, y: 2, w: 3, h: 2 },
      { x: 0, y: 4, w: 3, h: 2 },
      { x: 0, y: 6, w: 3, h: 2 },
      { x: 0, y: 8, w: 3, h: 2 },
      { x: 0, y: 10, w: 3, h: 2 },
      { x: 0, y: 12, w: 3, h: 2 },
      { x: 0, y: 14, w: 3, h: 2, deep: true },
      { x: 0, y: 0, w: 10, h: 2 },
      { x: 8, y: 2, w: 3, h: 2 },
      { x: 7, y: 4, w: 4, h: 2 },
      { x: 0, y: 7, w: 11, h: 2 },
      { x: 9, y: 9, w: 3, h: 2 },
      { x: 8, y: 11, w: 4, h: 2 },
      { x: 0, y: 14, w: 12, h: 2 },
      { x: 3, y: 2, w: 4, h: 2 },
      { x: 3, y: 9, w: 5, h: 2 },
    ],
    traces: [
      { x1: 1, y1: 1, x2: 9, y2: 1 },
      { x1: 1, y1: 1, x2: 1, y2: 15 },
      { x1: 9, y1: 1, x2: 9, y2: 5 },
      { x1: 1, y1: 8, x2: 10, y2: 8 },
      { x1: 10, y1: 8, x2: 10, y2: 12 },
      { x1: 1, y1: 15, x2: 11, y2: 15 },
      { x1: 5, y1: 3, x2: 7, y2: 3 },
      { x1: 5, y1: 10, x2: 7, y2: 10 },
    ],
  },
  {
    offset: 36,
    blocks: [
      { x: 1, y: 0, w: 10, h: 2 },
      { x: 0, y: 2, w: 3, h: 2 },
      { x: 0, y: 4, w: 3, h: 2 },
      { x: 1, y: 6, w: 9, h: 2 },
      { x: 8, y: 8, w: 3, h: 2 },
      { x: 9, y: 10, w: 3, h: 2 },
      { x: 0, y: 12, w: 3, h: 2 },
      { x: 1, y: 14, w: 11, h: 2, deep: true },
      { x: 10, y: 8, w: 2, h: 2 },
      { x: 0, y: 10, w: 2, h: 2 },
      { x: 4, y: 2, w: 5, h: 2 },
      { x: 5, y: 10, w: 4, h: 2 },
    ],
    traces: [
      { x1: 2, y1: 1, x2: 10, y2: 1 },
      { x1: 1, y1: 1, x2: 1, y2: 4 },
      { x1: 2, y1: 7, x2: 9, y2: 7 },
      { x1: 10, y1: 7, x2: 10, y2: 11 },
      { x1: 1, y1: 13, x2: 1, y2: 15 },
      { x1: 2, y1: 15, x2: 11, y2: 15 },
      { x1: 6, y1: 3, x2: 8, y2: 3 },
      { x1: 6, y1: 11, x2: 8, y2: 11 },
    ],
  },
  {
    offset: 54,
    blocks: [
      { x: 0, y: 0, w: 3, h: 2 },
      { x: 0, y: 2, w: 3, h: 2 },
      { x: 0, y: 4, w: 3, h: 2 },
      { x: 0, y: 6, w: 3, h: 2 },
      { x: 0, y: 8, w: 3, h: 2 },
      { x: 0, y: 10, w: 3, h: 2 },
      { x: 0, y: 12, w: 3, h: 2 },
      { x: 0, y: 14, w: 3, h: 2, deep: true },
      { x: 11, y: 0, w: 3, h: 2 },
      { x: 11, y: 2, w: 3, h: 2 },
      { x: 11, y: 4, w: 3, h: 2 },
      { x: 11, y: 8, w: 3, h: 2 },
      { x: 11, y: 10, w: 3, h: 2 },
      { x: 11, y: 12, w: 3, h: 2 },
      { x: 11, y: 14, w: 3, h: 2, deep: true },
      { x: 0, y: 7, w: 14, h: 2 },
      { x: 4, y: 7, w: 3, h: 2 },
      { x: 7, y: 7, w: 3, h: 2 },
      { x: 11, y: 6, w: 3, h: 2 },
      { x: 0, y: 6, w: 3, h: 2 },
    ],
    traces: [
      { x1: 1, y1: 1, x2: 1, y2: 15 },
      { x1: 12, y1: 1, x2: 12, y2: 6 },
      { x1: 12, y1: 9, x2: 12, y2: 15 },
      { x1: 1, y1: 8, x2: 13, y2: 8 },
      { x1: 6, y1: 8, x2: 6, y2: 10 },
      { x1: 8, y1: 8, x2: 8, y2: 10 },
    ],
  },
];

let svg =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<svg viewBox="0 0 288 64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="RBSH">';

for (const letter of letters) {
  svg += `<g transform="translate(${px(letter.offset)}, 0)">`;
  for (const block of letter.blocks) {
    svg += `<rect x="${px(block.x)}" y="${px(block.y)}" width="${px(block.w)}" height="${px(block.h)}" fill="${block.deep ? ORANGE_DEEP : ORANGE}"/>`;
  }
  for (const trace of letter.traces) {
    svg += `<line x1="${px(trace.x1)}" y1="${px(trace.y1)}" x2="${px(trace.x2)}" y2="${px(trace.y2)}" stroke="${WIRE}" stroke-width="1.25" stroke-linecap="square"/>`;
    svg += `<line x1="${px(trace.x1 + 0.35)}" y1="${px(trace.y1 + 0.35)}" x2="${px(trace.x2 + 0.35)}" y2="${px(trace.y2 + 0.35)}" stroke="${WIRE}" stroke-width="1.25" stroke-linecap="square" opacity="0.55"/>`;
  }
  svg += "</g>";
}

svg += "</svg>";
writeFileSync("public/assets/RBSH.svg", svg);
console.log("Wrote public/assets/RBSH.svg");
