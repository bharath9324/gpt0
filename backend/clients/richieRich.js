const WebSocket = require("ws");
const RRML2HTML = require("../utils/RRML2HTML");

const VALID_CLOSINGS = ["</header>", "</subheader>", "</body>", "</card>"]


function processAndPassWebSocketData(prompt, ws) {
  const socket = new WebSocket('ws://localhost:8082/v1/stream');
  return new Promise((resolve, reject) => {
    let responses = [];

    socket.addEventListener('open', () => {
      console.log('Connected to server');
      socket.send(prompt);
    });

    socket.addEventListener('message', (event) => {
      console.log('Received message:', event.data);
      responses.push(event.data);
      const processed = chunkResponseLastElement(responses);
      responses = processed[0]
      const nextChunk = processed[1]
      if (nextChunk != null) {
        processAndSendResponse(responses, ws)
        responses = [nextChunk]
      }
    });

    socket.addEventListener('close', () => {
      processAndSendResponse(responses, ws)
      ws.close()
      console.log('Connection closed by server');
      resolve();
    });

    socket.addEventListener('error', (err) => {
      console.error('WebSocket error:', err);
      reject(err); // Reject if an error occurs
    });
  });
}

function processAndSendResponse(response, ws) {
  const procesedHTML = RRML2HTML(response.join(""));
  ws.send(procesedHTML);
}

function chunkResponseLastElement(response) {
  const lastElement = response.pop()
  let maxIndexAndClosing = [-1, ""]
  for (var i = 0; i < VALID_CLOSINGS.length; i++) {
    const index = lastElement.indexOf(VALID_CLOSINGS[i])
    if (maxIndexAndClosing[0] < index) {
      maxIndexAndClosing = [index, VALID_CLOSINGS[i]]
    }
  }
  if (maxIndexAndClosing[0] == -1) {
    response.push(lastElement)
    return [response, null]
  }
  const split = lastElement.split(maxIndexAndClosing[1])
  const next = split.pop()
  let newLastElement =  split.join(maxIndexAndClosing[1])
  newLastElement += maxIndexAndClosing[1]
  response.push(newLastElement)
  return [response, next]
} 

module.exports = {
  processAndPassWebSocketData,
};
