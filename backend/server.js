const express = require("express");
const cors = require("cors");
const url = require("url");

const { processAndPassWebSocketData } = require("./clients/richieRich");
const http = require("http");

const WebSocket = require("ws");
const wsServer = new WebSocket.Server({ noServer: true });

const PORT = 8081;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

wsServer.on("connection", async (ws) => {
  console.log("Connected")
  ws.on("message", async (prompt) => {
    console.log("Received prompt from frontend: ", prompt);
    processAndPassWebSocketData(prompt, ws);
  });
});

server.on("upgrade", (request, socket, head) => {
  console.log("Upgraded")
  const pathname = url.parse(request.url).pathname;

  if (pathname === "/v1/backend/stream") {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
      wsServer.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});


server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
