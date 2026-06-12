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
      setPlayerColor(color);
    });

    socket.on("roomFull", () => {
      alert("Room is full");
    });

    socket.on("gameState", ({ fen }) => {
      setFen(fen);
    });

    return () => {
      socket.off("playerColor");
      socket.off("roomFull");
      socket.off("gameState");
    };
  }, []);

  const joinRoom = () => {
    if (!roomId.trim()) return;

    socket.emit("joinRoom", roomId);
    setJoined(true);
  };

  const onDrop = (sourceSquare, targetSquare) => {
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
            Example room: chess123
          </p>
        </>
      ) : (
        <>
          <h3>Room: {roomId}</h3>
          <h3>You are: {playerColor}</h3>

          <div style={{ width: "600px", margin: "0 auto" }}>
            <Chessboard
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