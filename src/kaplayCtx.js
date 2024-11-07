import kaplay from "kaplay";

const canvas = document.getElementById("game");

export const k = kaplay({
  global: false,
  scale: 1.2,
  touchToMouse: true,
  canvas: canvas,
});
