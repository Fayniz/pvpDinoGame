const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let sockets = [];

wss.on('connection', (ws) => {
  console.log('Browser connected to WebSocket');
  sockets.push(ws);

  ws.on('close', () => {
    sockets = sockets.filter(s => s !== ws);
  });
});

app.get('/jump', (req, res) => {
  console.log('Received jump from unPhone');
  sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('jump');
    }
  });
  res.send('player1 jump');
});
app.get('/jump2', (req, res) => {
  console.log('Received jump from unPhone');
  sockets.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('jump2');
    }
  });
  res.send('player2 jump');
});


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server with WebSocket listening on http://localhost:${PORT}`);
});
