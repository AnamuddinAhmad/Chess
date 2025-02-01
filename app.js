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

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(port, () => {
  console.log("Server listening on", port);
});
