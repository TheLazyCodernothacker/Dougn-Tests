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
  socket.on("joinGame", (gameId, playerId) => {
    try {
      const game = game.find((game) => game.id === gameId);
      if (game) {
        game.players.push(new Player(socket.id));
      }
    } catch {
      socket.emit("error");
    }
  });
  socket.on("getGames", () => {
    socket.emit("gamesData", games);
  });
  socket.on("play", () => {
    console.log("New client connected");
    socket.emit("game", game, socket.id);
    game.players.push(new Player(socket.id));
    socket.on("coordinates", (coords) => {
      let player = game.players.find((p) => p.id === socket.id);
      player.coords = coords;
      console.log(player.coords);
      io.emit("update", game);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected");
      game.players = game.players.filter((p) => p.id !== socket.id);
      io.emit("update", game);
    });
    socket.on("move", (dir, data) => {
      let player = game.players.find((p) => p.id === socket.id);
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
      console.log(playerCoords);
      player.coords = playerCoords;
      console.log(playerCoords, socket.id);
      socket.emit("private-update", player);
      io.emit("update", game);
    });
  });
});
