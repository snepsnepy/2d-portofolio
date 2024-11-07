import { k } from "./kaplayCtx";
import { dialogueData, scaleFactor } from "./constants";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 21,
  sliceY: 11,
});

k.loadSprite("character", "./character.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 5 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 5 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 5 },
  },
});

k.loadSprite("toyota", "./toyobaru.png", {
  sliceX: 9.8,
  sliceY: 3.9,
});

k.loadSprite("honda", "./hondica.png", {
  sliceX: 9,
  sliceY: 4.3,
});

k.loadSprite("map", "./map.png");
k.setBackground(k.Color.fromHex("#4379F2"));

k.scene("main", async () => {
  k.add([
    k.pos(15, 420),
    k.text("Click/Tap around to move", {
      size: 28, // 48 pixels tall
      width: 500, // it'll wrap to next line when width exceeds this value
      font: "jersey", // specify any font you loaded or browser built-in
    }),
    k.color(k.Color.fromHex("#ffeb00")),
  ]);

  k.add([
    k.pos(15, 450),
    k.text(
      "Feel free to sit at the table, use the PC, or check out the cars to discover more about me!",
      {
        size: 32, // 48 pixels tall
        width: 500, // it'll wrap to next line when width exceeds this value
        font: "jersey", // specify any font you loaded or browser built-in
      }
    ),
    k.color(k.Color.fromHex("#ffeb00")),
  ]);

  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("character", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),

    k.body(),
    k.anchor("center"),
    k.pos(scaleFactor),
    k.scale(4.2),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "Collisions") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }

      continue;
    }

    if (layer.name === "SpawnPoint") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.getCurAnim().name !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.getCurAnim().name !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.getCurAnim().name !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.getCurAnim().name !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  k.onMouseRelease(() => {
    player.play("idle-down");
  });
});

k.go("main");
