import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";

const socket = io("https://online-chess-production-12da.up.railway.app");

function App() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [playerColor, setPlayerColor] = useState("");
  const [game, setGame] = useState(new Chess());

  useEffect(() => {
    socket.on("playerColor", (color) => {
      setPlayerColor(color);
    });

    socket.on("roomFull", () => {
      alert("Room is full");
    });

    socket.on("gameState", ({ fen }) => {
      const chess = new Chess(fen);
      setGame(chess);
    });

    return () => {
      socket.off("playerColor");
      socket.off("roomFull");
      socket.off("gameState");
    };
  }, []);

  const joinRoom = () => {
    if (!roomId) return;

    socket.emit("joinRoom", roomId);
    setJoined(true);
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const chess = new Chess(game.fen());

    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) return false;

      setGame(chess);

      socket.emit("move", {
        roomId,
        move: {
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        },
      });

      return true;
    } catch {
      return false;
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <h1>Online Chess</h1>

      {!joined ? (
        <>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            style={{
              padding: "10px",
              width: "250px",
              marginRight: "10px",
            }}
          />

          <button onClick={joinRoom}>
            Join Room
          </button>

          <p style={{ marginTop: "20px" }}>
            Example Room ID: chess123
          </p>
        </>
      ) : (
        <>
          <h3>Room: {roomId}</h3>
          <h3>You are: {playerColor}</h3>

          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardOrientation={playerColor === "black" ? "black" : "white"}
          />
        </>
      )}
    </div>
  );
}

export default App;