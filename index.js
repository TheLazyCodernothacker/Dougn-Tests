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

class Game {
  constructor(id, name) {
    this.offset = { x: -545, y: -600 };
    this.id = id;
    this.name = name;
    this.players = [];
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
        x: -1 * player.x + canvasWidth / 2 - 196 / 8,
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
    player.coords = playerCoords;
    console.log(player);
    io.to(game.id).emit("update", game);
  });
});
