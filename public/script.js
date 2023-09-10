const socket = io();

const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillRect(0, 0, canvas.width, canvas.height);
const offset = {};

socket.on("private-update", (data) => {
  offset.x = data.x;
  offset.y = data.y;
});

socket.on("game", (game, playerId) => {
  console.log(game);
  offset.x = game.offset.x;
  offset.y = game.offset.y;
  startGame();
  console.log(game);
  opponents = game.players.filter((p) => p.id !== socket.id);
});

socket.on("update", (game) => {
  opponents = game.players.filter((p) => p.id !== socket.id);
});

function startGame() {
  const map = new Image();
  map.src = "Pellet Town.png";

  const player = new Image();
  player.src = "playerDown.png";

  player.onload = () => {
    ctx.drawImage(
      player,
      0,
      0,
      48,
      64,
      canvas.width / 2 - player.width / 8,
      canvas.height / 2 - player.height / 2,
      player.width / 4,
      player.height
    );
  };

  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
        keys.up = true;
        break;
      case "ArrowDown":
      case "s":
        keys.down = true;
        break;
      case "ArrowLeft":
      case "a":
        keys.left = true;
        break;
      case "ArrowRight":
      case "d":
        keys.right = true;
        break;
    }
  });

  window.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
        keys.up = false;
        break;
      case "ArrowDown":
      case "s":
        keys.down = false;
        break;
      case "ArrowLeft":
      case "a":
        keys.left = false;
        break;
      case "ArrowRight":
      case "d":
        keys.right = false;
        break;
    }
  });
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let playerCoords = {
      x: -1 * offset.x + canvas.width / 2 - player.width / 8,
      y: -1 * offset.y + canvas.height / 2 - player.height / 2,
    };
    if (keys.up) socket.emit("move", "up", playerCoords);
    if (keys.down) socket.emit("move", "down", playerCoords);
    if (keys.left) socket.emit("move", "left", playerCoords);
    if (keys.right) socket.emit("move", "right", playerCoords);
    ctx.drawImage(map, offset.x, offset.y, map.width, map.height);
    if (typeof opponents !== "undefined") {
      opponents.forEach((opponent) => {
        ctx.drawImage(
          player,
          0,
          0,
          48,
          64,
          opponent.coords.x + offset.x,
          opponent.coords.y + offset.y,
          player.width / 4,
          player.height
        );
      });
    }
    ctx.drawImage(
      player,
      0,
      0,
      48,
      64,
      canvas.width / 2 - player.width / 8,
      canvas.height / 2 - player.height / 2,
      player.width / 4,
      player.height
    );
    requestAnimationFrame(animate);
  }

  animate();
}
