const socket = io();

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
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const offset = {};

  socket.emit(
    "playGame",
    localStorage.getItem("gameId"),
    localStorage.getItem("playerId")
  );

  socket.on("loadGame", (game, playerId, player) => {
    offset.x = game.offset.x;
    offset.y = game.offset.y;
    if (player.x) {
      offset.x = player.x;
      offset.y = player.y;
    }
    loadGame();
    opponents = game.players.filter((p) => p.id !== socket.id);
  });

  socket.on("update", (game) => {
    let player = game.players.find(
      (p) => p.id === localStorage.getItem("playerId")
    );
    if (!player) return alert("Something is off");
    offset.x = player.x;
    offset.y = player.y;
    opponents = game.players.filter((p) => p.id !== socket.id);
    console.log(opponents);
  });

  function loadGame() {
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

    class Tile {
      constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.image = image;
      }
      draw() {
        ctx.drawImage(
          this.image,
          this.x + offset.x,
          this.y + offset.y,
          this.width,
          this.height
        );
      }
    }

    const SpiralEyeChiseledStone = new Image();
    SpiralEyeChiseledStone.src = "./assets/Textures/SpiralEyeChiseledStone.png";
    const test = new Tile(0, 0, SpiralEyeChiseledStone);

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
    function readArray(array) {
      console.log(array);
      for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
          tiles.push(new Tile(64 * j, 64 * i, array[i][j]));
        }
      }
    }
    const tiles = [];
    readArray([
      [SpiralEyeChiseledStone],
      [SpiralEyeChiseledStone, SpiralEyeChiseledStone],
    ]);
    console.log(tiles);
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let data = {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        playerWidth: player.width,
        playerHeight: player.height,
        gameId: localStorage.getItem("gameId"),
        playerId: localStorage.getItem("playerId"),
      };
      if (keys.up) socket.emit("move", "up", data);
      if (keys.down) socket.emit("move", "down", data);
      if (keys.left) socket.emit("move", "left", data);
      if (keys.right) socket.emit("move", "right", data);
      ctx.drawImage(map, offset.x, offset.y, map.width, map.height);
      tiles.forEach((tile) => tile.draw());
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
  <button class="rounded bg-neutral-500 px-2 py-1 text-xl mt-4" onclick="socket.emit('joinGame', '${game.id}')">Join</button>
`;
      games.appendChild(gameElement);
    });
  });
}
