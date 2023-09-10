const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path"); // Add this line to use the 'path' module

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

const game = { offset: { x: -545, y: -600 }, players: [] };

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
  constructor(id) {
    this.id = id;
    this.x = -545;
    this.y = -600;
    this.coords = { x: 0, y: 0 };
  }
}

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.emit("game", game, socket.id);
  game.players.push(new Player(socket.id));
  socket.on("move", (dir, playerCoords) => {
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
    player.coords = playerCoords;
    console.log(playerCoords);
    socket.emit("private-update", player);
    io.emit("update", game);
    console.log("updating game", ++count);
  });
});
