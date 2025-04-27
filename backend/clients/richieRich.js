const WebSocket = require("ws");
const axios = require("axios");

async function getRichieRichResponse(prompt) {
  try {
    const response = await axios.post(
      "http://localhost:8082/v1/chat/completions",
      {
        prompt,
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

function getWebSocketData(prompt) {
  const socket = new WebSocket('ws://localhost:8082/v1/stream');
  return new Promise((resolve, reject) => {
    const responses = [];

    socket.addEventListener('open', () => {
      console.log('Connected to server');
      socket.send(prompt);
    });

    socket.addEventListener('message', (event) => {
      console.log('Received message:', event.data);
      responses.push(event.data);
    });

    socket.addEventListener('close', () => {
      console.log('Connection closed by server');
      resolve(responses); // Resolve with the collected data
    });

    socket.addEventListener('error', (err) => {
      console.error('WebSocket error:', err);
      reject(err); // Reject if an error occurs
    });
  });
}

module.exports = {
  getRichieRichResponse,
  getWebSocketData,
};
