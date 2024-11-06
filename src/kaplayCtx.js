import kaplay from "kaplay";

const canvas = document.getElementById("game");

export const k = kaplay({
  global: false,
  touchToMouse: true,
  canvas: canvas,
});
