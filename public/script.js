const socket = io();

socket.on("notwogames", () => {
  alert("You are already in a game");
});

socket.on("joinedGame", (gameId, playerId) => {
  localStorage.setItem("gameId", gameId);
  localStorage.setItem("playerId", playerId);
  window.location = "game.html";
});

// JavaScript
function createGame() {
  const name = prompt("What name would you like to use?");
  socket.emit("createGame", name);
  window.location = "server.html";
}

const createButton = document.getElementById("create");

if (createButton) {
  createButton.addEventListener("click", createGame);
}

function play() {
  let game = {};
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const offset = {};

  socket.emit(
    "playGame",
    localStorage.getItem("gameId"),
    localStorage.getItem("playerId"),
    canvas.width,
    canvas.height
  );

  socket.on("loadGame", (game, playerId, player) => {
    offset.x = game.offset.x;
    offset.y = game.offset.y;
    if (player.x) {
      offset.x = player.x;
      offset.y = player.y;
    }
    loadGame(player.coords.x, player.coords.y);

    opponents = game.players.filter(
      (p) => p.id !== localStorage.getItem("playerId")
    );
  });

  socket.on("update", (game) => {
    let player = game.players.find(
      (p) => p.id === localStorage.getItem("playerId")
    );
    if (!player) return alert("Something is off");
    offset.x = player.x;
    offset.y = player.y;
    playerData.coords = player.coords;
    opponents = game.players.filter(
      (p) => p.id !== localStorage.getItem("playerId")
    );
  });

  function loadGame(x, y) {
    playerData = {
      coords: { x: x, y: y },
    };
    const map = new Image();
    map.src = "Pellet Town.png";
    const tileset = new Image();
    tileset.src = "assets/tiles.png";
    const player = new Image();
    player.src =
      "assets/Character_animation/priests_idle/priest1/v1/priest1_v1_1.png";
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

    class Tile {
      constructor(x, y, sx, sy, collision) {
        this.x = x;
        this.y = y;
        this.sx = sx;
        this.sy = sy;
        this.width = 64;
        this.height = 64;
        this.collision = collision;
      }
      draw() {
        ctx.drawImage(
          tileset,
          this.sx * 16, // source x
          this.sy * 16, // source y
          16,
          16,
          this.x + offset.x, // destination x
          this.y + offset.y, // destination y
          this.width, // destination width
          this.height // destination height
        );
      }
    }

    const SECS = new Image();
    SECS.src = "./assets/Textures/SpiralEyeChiseledStone.png";
    const CSB = new Image();
    CSB.src = "./assets/Textures/CrackedStoneBricks.png";
    const ECS = new Image();
    ECS.src = "./assets/Textures/EyeChiseledStone.png";
    const SB = new Image();
    SB.src = "./assets/Textures/StoneBricks.png";
    const MSB = new Image();
    MSB.src = "./assets/Textures/MossyStoneBricks.png";
    let collisions = [
      1, 2, 3, 4, 5, 6, 11, 16, 21, 26, 31, 36, 41, 42, 43, 44, 45, 46, 51, 52,
      53, 54, 55, 56,
    ];
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
    function checkCollision(coords) {
      let collision = tiles.find((tile) => {
        if (tile.collision) {
          if (
            tile.x + 64 > coords.x &&
            tile.x < coords.x + player.width / 4 &&
            tile.y + 64 > coords.y &&
            tile.y < coords.y + player.height
          ) {
            return true;
          }
        }
      });
      console.log(collision);
      return collision;
    }
    function readArray(array) {
      array = array.filter((a) => a !== 0);
      for (let i = 0; i < array.length; i++) {
        let x = (array[i] - 1) % 10;
        let y = Math.floor((array[i] - 1) / 10);
        let collision = collisions.includes(array[i]);
        tiles.push(
          new Tile(64 * (i % 48), 64 * Math.floor(i / 48), x, y, collision)
        );
      }
      console.log(tiles);
    }
    const tiles = [];
    readArray([
      1, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 11, 12, 12, 12, 12, 12, 12,
      12, 31, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 16, 1, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 11, 12,
      12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 1, 12, 12, 12, 12, 12, 12, 12, 31,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 51, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 16, 1, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 11,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 1, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 31, 2, 2, 2, 37, 38, 2, 2, 36, 12, 12,
      12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12,
      12, 12, 12, 12, 12, 12, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42,
      42, 46, 12, 12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12,
      12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12,
      12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12,
      12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12,
      12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11,
      12, 12, 12, 12, 12, 12, 12, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6,
      12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12,
      12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12, 12, 12, 12,
      12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11,
      12, 12, 12, 12, 12, 12, 12, 1, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12,
      12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 11,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12,
      12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12,
      12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 1, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12,
      12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12,
      12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16,
      12, 12, 12, 12, 12, 12, 12, 12, 31, 22, 12, 12, 12, 12, 12, 12, 36, 12,
      12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 41, 42, 42, 42,
      42, 42, 37, 38, 42, 42, 42, 42, 42, 42, 42, 12, 12, 12, 12, 12, 12, 12,
      12, 31, 22, 12, 12, 12, 12, 12, 22, 36, 22, 22, 22, 12, 12, 12, 12, 6, 11,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 41, 42, 42, 37, 38, 42,
      42, 42, 46, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6,
      11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
      12, 12, 12, 12, 6, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42,
      42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42,
      42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 46,
    ]);
    console.log(tiles);
    let frames = 0;
    let playerFrame = 0;
    function animate() {
      frames += 1;
      playerFrame += 1;
      if (frames % 10 === 0) {
        player.src = `assets/Character_animation/priests_idle/priest1/v1/priest1_v1_${
          (playerFrame % 4) + 1
        }.png`;
      }
      console.log((playerFrame % 4) + 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let data = {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        playerWidth: player.width,
        playerHeight: player.height,
        gameId: localStorage.getItem("gameId"),
        playerId: localStorage.getItem("playerId"),
      };
      if (keys.up) {
        socket.emit("move", "up", data);
      }
      if (keys.down) {
        socket.emit("move", "down", data);
      }
      if (keys.left) {
        socket.emit("move", "left", data);
      }
      if (keys.right) {
        socket.emit("move", "right", data);
      }
      tiles.forEach((tile) => tile.draw());
      if (typeof opponents !== "undefined" && opponents.length > 0) {
        opponents.forEach((opponent) => {
          ctx.drawImage(
            player,
            0,
            0,
            16,
            16,
            opponent.coords.x + offset.x,
            opponent.coords.y + offset.y,
            64,
            64
          );
        });
      }
      ctx.drawImage(
        player,
        0,
        0,
        16,
        16,
        canvas.width / 2 - player.width / 8,
        canvas.height / 2 - player.height / 2,
        64,
        64
      );
      requestAnimationFrame(animate);
    }

    animate();
  }
}

function getGames() {
  socket.emit("getGames");
  socket.on("gamesData", (gamesData) => {
    gamesData.forEach((game) => {
      const gameElement = document.createElement("div");
      gameElement.setAttribute("class", "p-4 rounded bg-neutral-700");
      gameElement.innerHTML = `
        <h1 class="text-4xl">${game.name}</h1>
        <p class="text-2xl mt-2">${game.players.length} players</p>
        ${
          game.players.find(
            (player) => player.id === localStorage.getItem("playerId")
          )
            ? "<button class='rounded bg-neutral-500 px-2 py-1 text-xl mt-'4 onclick='window.location = \"game.html\"'> Continue</button>"
            : `<button class="rounded bg-neutral-500 px-2 py-1 text-xl mt-4" onclick="socket.emit('joinGame', '${
                game.id
              }', '${localStorage.getItem("gameId")}', '${localStorage.getItem(
                "playerId"
              )}')">Join</button>`
        }`;

      games.appendChild(gameElement);
    });
  });
}
