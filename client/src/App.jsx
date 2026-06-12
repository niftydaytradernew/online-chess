import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { io } from "socket.io-client";

const socket = io("https://online-chess-production-12da.up.railway.app");

function App() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [playerColor, setPlayerColor] = useState("");
  const [fen, setFen] = useState("start");

  useEffect(() => {
    socket.on("playerColor", (color) => {
      console.log("Player color:", color);
      setPlayerColor(color);
    });

    socket.on("roomFull", () => {
      alert("Room is full");
    });

    socket.on("gameState", ({ fen }) => {
      console.log("Game state:", fen);
      setFen(fen);
    });

    return () => {
      socket.off("playerColor");
      socket.off("roomFull");
      socket.off("gameState");
    };
  }, []);

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Enter a room ID");
      return;
    }

    socket.emit("joinRoom", roomId);
    setJoined(true);
  };

  const onDrop = (sourceSquare, targetSquare) => {
    alert(`Move: ${sourceSquare} -> ${targetSquare}`);

    socket.emit("move", {
      roomId,
      move: {
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      },
    });

    return true;
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "20px auto",
        textAlign: "center",
        fontFamily: "Arial",
        padding: "20px",
      }}
    >
      <h1>Online Chess</h1>

      {!joined ? (
        <>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{
              padding: "10px",
              width: "250px",
              marginRight: "10px",
            }}
          />

          <button
            onClick={joinRoom}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Join Room
          </button>

          <p style={{ marginTop: "20px" }}>
            Example room: chess123
          </p>
        </>
      ) : (
        <>
          <h3>Room: {roomId}</h3>
          <h3>You are: {playerColor || "Waiting..."}</h3>

          <div
            style={{
              width: "600px",
              maxWidth: "100%",
              margin: "0 auto",
            }}
          >
            <Chessboard
              id="OnlineChessBoard"
              position={fen}
              boardOrientation={
                playerColor === "black" ? "black" : "white"
              }
              onPieceDrop={onDrop}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;