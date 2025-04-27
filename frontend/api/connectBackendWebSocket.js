
import { websocketUrl } from "./constants";

export function connectBackendWebSocket(prompt, onMessageReceived) {
    const socket = new WebSocket(websocketUrl);
    return new Promise((resolve, reject) => {
      console.log("Inside Promise")
      socket.addEventListener('open', () => {
        console.log('Connected to server');
        socket.send(prompt);
      });
  
      socket.addEventListener('message', (event) => {
        console.log('Received message:', event.data);
        onMessageReceived(event.data)
      });
  
      socket.addEventListener('close', () => {
        console.log('Connection closed by server');
        resolve();
      });
  
      socket.addEventListener('error', (err) => {
        console.error('WebSocket error:', err);
        reject(err); // Reject if an error occurs
      });
    });
  }