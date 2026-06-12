const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Chess server running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        chess: new Chess(),
        players: []
      };
    }

    const room = rooms[roomId];

    if (room.players.length >= 2) {
      socket.emit("roomFull");
      return;
    }

    const color = room.players.length === 0 ? "white" : "black";

    room.players.push({
      id: socket.id,
      color
    });

    socket.join(roomId);

    socket.emit("playerColor", color);

    io.to(roomId).emit("gameState", {
      fen: room.chess.fen()
    });

    console.log(`${socket.id} joined room ${roomId} as ${color}`);
  });

  socket.on("move", ({ roomId, move }) => {
    const room = rooms[roomId];

    if (!room) return;

    try {
      const result = room.chess.move(move);

      if (!result) return;

      io.to(roomId).emit("gameState", {
        fen: room.chess.fen()
      });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    for (const roomId in rooms) {
      rooms[roomId].players =
        rooms[roomId].players.filter(
          (player) => player.id !== socket.id
        );

      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});