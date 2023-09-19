const socket = io();

// JavaScript
function createGame() {
  socket.emit("createGame");
  window.location = 'server.html'
}

const createButton = document.getElementById('create');

if (createButton) {
  createButton.addEventListener("click", createGame);
}


function play(){

const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillRect(0, 0, canvas.width, canvas.height);
const offset = {};

socket.emit("play")

socket.on("private-update", (data) => {
  offset.x = data.x;
  offset.y = data.y;
});

socket.on("game", (game, playerId) => {
  offset.x = game.offset.x;
  offset.y = game.offset.y;
  startGame();
  opponents = game.players.filter((p) => p.id !== socket.id);
});

socket.on("update", (game) => {
  opponents = game.players.filter((p) => p.id !== socket.id);
  console.log(opponents)
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

  class Tile {
    constructor(x, y, image){
      this.x = x;
      this.y = y;
      this.width = 16;
      this.height = 16;
      this.image = image;
    }
    draw(){
      ctx.drawImage(this.image, this.x + offset.x, this.y + offset.y, this.width, this.height);
    }
  }

  const SpiralEyeChiseledStone = new Image();
  SpiralEyeChiseledStone.src = "./assets/Textures/SpiralEyeChiseledStone.png"
  const test = new Tile(0,0, SpiralEyeChiseledStone)
  
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
  function readArray(array){
    console.log(array)
    for(let i = 0; i < array.length; i++){
      for(let j = 0; j < array[i].length; j++){
        tiles.push(new Tile(16*j, 16*i, array[i][j]))
      }
    }
  }
  const tiles = [];
  readArray([[SpiralEyeChiseledStone, ], [SpiralEyeChiseledStone, SpiralEyeChiseledStone]])
  console.log(tiles)
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let data = {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      playerWidth: player.width,
      playerHeight: player.height,
    }
    if (keys.up) socket.emit("move", "up", data);
    if (keys.down) socket.emit("move", "down", data);
    if (keys.left) socket.emit("move", "left", data);
    if (keys.right) socket.emit("move", "right", data);
    ctx.drawImage(map, offset.x, offset.y, map.width, map.height);
    tiles.forEach(tile => tile.draw())
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

function getGames(){
  socket.emit("getGames")
  socket.on("gamesData", gamesData => {
  gamesData.forEach(game => {
    const gameElement = document.createElement("div");
    const gameHeader = document.createElement("h1");
    gameHeader.innerText = game.id;
    const gameButton = document.createElement("button");
    gameButton.innerText = "Join game";
    gameButton.onclick = () => {
      console.log('joining game');
    }
    gameElement.appendChild(gameHeader);
    gameElement.appendChild(gameButton);
    games.appendChild(gameElement)
  })
})
}