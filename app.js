const express = require("express");
const http = require("http");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const chess = new Chess();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socket(server);

let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

io.on("connection", (uniqueSocket) => {
  console.log("Connected", Date.now());

  //Condtion for the Player and Specetattor
  if (!players.white) {
    players.white = uniqueSocket.id;
    uniqueSocket.emit("playersRole", "w");
  } else if (!players.black) {
    players.black = uniqueSocket.id;
    uniqueSocket.emit("playersRole", "b");
  } else {
    uniqueSocket.emit("spectatorRole");
  }

  //For move
  uniqueSocket.on("move", (move) => {
    try {
      //It will help to detect the worng turn;
      if (chess.turn === "w" && uniqueSocket.id !== players.white) return;
      if (chess.turn === "b" && uniqueSocket.id !== players.black) return;
      //Checking result for move
      const result = chess.move(move);
      uniqueSocket.emit("route",result);
      //if result will be true;
      if (result) {
        currentPlayer = chess.turn();
        //Why here io using instead of uniqueSocket
        //Beacause we have to tell them all who all are watching the game.
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid Move");
        uniqueSocket.emit("invalidMove", move);
      }
    } catch (err) {
      console.log("Err due to move : ", err.message);
      uniqueSocket.emit("invalidMove", move);
    }
  });

  //For disconnect
  uniqueSocket.on("disconnect", () => {
    if (uniqueSocket.id === players.white) {
      delete players.white;
      
    } else if (uniqueSocket.id === players.black) {
      delete players.black;
    }
    console.log("Disconnected", Date.now());
  });
});

server.listen(port, () => {
  console.log("Server listening on", port);
});
