const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path"); // Add this line to use the 'path' module

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const { v4: uuidv4 } = require("uuid");
const PORT = process.env.PORT || 3000;

const game = { offset: { x: -545, y: -600 }, players: [] };
let games = [];

// Configure Express to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

count = 0;

class Player {
  constructor(id, name) {
    this.id = id;
    this.x = -545;
    this.y = -600;
    this.coords = { x: 0, y: 0 };
    this.name = name;
  }
}

function checkCollision(coords, tiles, player) {
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
  return collision;
}
let collisions = [
  1, 2, 3, 4, 5, 6, 11, 16, 21, 26, 31, 36, 41, 42, 43, 44, 45, 46, 51, 52, 53,
  54, 55, 56,
];
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
}
function readArray(array) {
  array = array.filter((a) => a !== 0);
  newTiles = [];
  for (let i = 0; i < array.length; i++) {
    let x = (array[i] - 1) % 10;
    let y = Math.floor((array[i] - 1) / 10);
    let collision = collisions.includes(array[i]);
    newTiles.push(
      new Tile(64 * (i % 48), 64 * Math.floor(i / 48), x, y, collision)
    );
  }
  return newTiles;
}
const tiles = readArray([
  1, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 16, 11, 12, 12, 12, 12, 12, 12, 12, 31, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 1,
  12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 16, 11, 12, 12, 12, 12, 12, 12, 12, 31, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 1,
  12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 51, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 16, 1, 12, 12, 12, 12, 12, 12, 12,
  31, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 1, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6,
  11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 31, 2, 2, 2, 37, 38, 2, 2, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  16, 12, 12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 36,
  12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 42, 42, 42, 42,
  42, 42, 42, 42, 42, 42, 42, 42, 42, 46, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12,
  12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 31,
  12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12,
  12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 31, 12,
  12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12,
  12, 12, 12, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 12, 12, 12, 12, 12,
  12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6,
  11, 12, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12,
  12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 1, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12, 12, 12,
  12, 12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11,
  12, 12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 31, 12, 12, 12, 12, 12, 12, 12,
  36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 1, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 16, 12, 12, 12, 12, 12, 12, 12,
  12, 31, 12, 12, 12, 12, 12, 12, 12, 36, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12,
  12, 12, 12, 12, 12, 12, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 16, 12, 12, 12, 12, 12, 12, 12, 12, 31, 22, 12, 12, 12, 12, 12, 12, 36,
  12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 41, 42, 42, 42,
  42, 42, 37, 38, 42, 42, 42, 42, 42, 42, 42, 12, 12, 12, 12, 12, 12, 12, 12,
  31, 22, 12, 12, 12, 12, 12, 22, 36, 22, 22, 22, 12, 12, 12, 12, 6, 11, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 41, 42, 42, 37, 38, 42, 42, 42, 46, 12,
  12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 6, 11, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
  12, 12, 12, 6, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42,
  42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42,
  42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 46,
]);
class Game {
  constructor(id, name) {
    this.offset = { x: -545, y: -600 };
    this.id = id;
    this.name = name;
    this.players = [];
    this.tiles = tiles;
  }
}

io.on("connection", (socket) => {
  socket.on("createGame", (name) => {
    if (!name) name = "Player " + count++;
    if (games.filter((game) => game.name === name).length > 0) {
      socket.emit("sameName");
    }
    games.push(new Game(uuidv4(), name));
    console.log(games);
  });
  socket.on("joinGame", (gameId, userGameId, playerId) => {
    try {
      const game = games.find((game) => game.id === gameId);
      let otherGame = games.find((game) => game.id === userGameId);
      if (otherGame) {
        otherPlayer = otherGame.players.find((p) => p.id === playerId);
        if (otherPlayer) {
          console.log(otherPlayer, 1234);
          socket.emit("notwogames");
          return;
        }
      }
      if (game) {
        game.players.push(new Player(socket.id));
        console.log(game);
        socket.emit("joinedGame", game.id, socket.id);
      }
    } catch (e) {
      console.log(e);
      socket.emit("error");
    }
  });
  socket.on("playGame", (gameId, playerId, canvasWidth, canvasHeight) => {
    const game = games.find(
      (game) =>
        game.id === gameId && game.players.find((p) => p.id === playerId)
    );

    if (game) {
      let player = game.players.find((p) => p.id === playerId);
      console.log(player);
      let playerCoords = {
        x: -1 * player.x + canvasWidth / 2 - 192 / 8,
        y: -1 * player.y + canvasHeight / 2 - 68 / 2,
      };
      player.coords = playerCoords;
      socket.join(gameId);
      socket.emit("loadGame", game, playerId, player);
    }
  });
  socket.on("getGames", () => {
    socket.emit("gamesData", games);
  });
  socket.on("move", (dir, data) => {
    let game = games.find((game) => game.id === data.gameId);
    if (!game) return;
    let player = game.players.find((p) => p.id === data.playerId);
    if (!player) return;
    switch (dir) {
      case "up":
        player.y += 3;
        break;
      case "down":
        player.y -= 3;
        break;
      case "left":
        player.x += 3;
        break;
      case "right":
        player.x -= 3;
        break;
    }

    let playerCoords = {
      x: -1 * player.x + data.canvasWidth / 2 - data.playerWidth / 8,
      y: -1 * player.y + data.canvasHeight / 2 - data.playerHeight / 2,
    };
    let playerData = {
      width: 192,
      height: 68,
      x: playerCoords.x,
      y: playerCoords.y,
    };

    if (checkCollision(playerCoords, game.tiles, playerData)) {
      switch (dir) {
        case "up":
          player.y -= 3;
          break;
        case "down":
          player.y += 3;
          break;
        case "left":
          player.x -= 3;
          break;
        case "right":
          player.x += 3;
          break;
      }
      console.log("collision");
      return;
    }
    player.coords = playerCoords;
    console.log("updating for everyone");
    io.to(game.id).emit("update", game);
  });
});
