const WebSocket = require("ws");
const RRML2HTML = require("../utils/RRML2HTML");

const VALID_CLOSINGS = ["</header>", "</subheader>", "</body>", "</card>"]


function processAndPassWebSocketData(prompt, ws) {
  const socket = new WebSocket('ws://localhost:8082/v1/stream');
  let currentChunk = [];

  socket.addEventListener('open', () => {
    console.log('Connected to server');
    socket.send(prompt);
  });

  socket.addEventListener('message', (event) => {
    console.log('Received message:', event.data);
    currentChunk.push(event.data);
    const currentAndNextChunk = maybeGetNextChunk(currentChunk);
    currentChunk = currentAndNextChunk[0]
    const nextChunk = currentAndNextChunk[1]
    if (nextChunk != null) {
      processAndSendResponse(currentChunk, ws)
      currentChunk = [nextChunk]
    }
  });

  socket.addEventListener('close', () => {
    processAndSendResponse(currentChunk, ws)
    ws.close()
    console.log('Connection closed by server');
  });
}

function processAndSendResponse(currentChunk, ws) {
  const procesedHTML = RRML2HTML(currentChunk.join(""));
  ws.send(procesedHTML);
}

function maybeGetNextChunk(currentChunk) {
  const lastElement = currentChunk.pop()
  let maxIndexOfClosingTag = [-1, ""]
  for (var i = 0; i < VALID_CLOSINGS.length; i++) {
    const index = lastElement.indexOf(VALID_CLOSINGS[i])
    if (maxIndexOfClosingTag[0] < index) {
      maxIndexOfClosingTag = [index, VALID_CLOSINGS[i]]
    }
  }
  if (maxIndexOfClosingTag[0] == -1) {
    currentChunk.push(lastElement)
    return [currentChunk, null]
  }
  const split = lastElement.split(maxIndexOfClosingTag[1])
  const next = split.pop()
  let newLastElement =  split.join(maxIndexOfClosingTag[1])
  newLastElement += maxIndexOfClosingTag[1]
  currentChunk.push(newLastElement)
  return [currentChunk, next]
} 

module.exports = {
  processAndPassWebSocketData,
};
