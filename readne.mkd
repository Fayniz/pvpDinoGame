# 🔹 Dino Game WebSocket Server

This WebSocket server enables real-time control of the browser-based Dino game. It listens for HTTP GET requests (e.g., from an unPhone) and broadcasts jump events to connected browser clients via WebSocket.

---

## 🚀 Installation Instructions

### 🛠️ Prerequisites

* Ubuntu (or other Linux/macOS system)
* Git
* `curl`
* No global Node.js installation (we'll use `nvm` for flexibility)

---

### ✅ 1. Install Node Version Manager (nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Then activate it:

```bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
```

Check it's working:

```bash
nvm --version
```

---

### ✅ 2. Install Node.js (LTS version)

```bash
nvm install 18
nvm use 18
nvm alias default 18
```

Verify the install:

```bash
node -v
npm -v
```

---

### 📁 3. Set Up the Project

```bash
mkdir -p ~/repos/jump-server
cd ~/repos/jump-server
npm init -y
npm install express ws cors
```

---

### 📝 4. Create the WebSocket Server

Create a file called `server.js`:

```bash
nano server.js
```

Paste the following code:

```js
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
  res.send('OK');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server with WebSocket listening on http://localhost:${PORT}`);
});
```

---

### ▶ 5. Run the Server

```bash
node server.js
```

You should see:

```
Server with WebSocket listening on http://localhost:3000
```

---

### ✅ 6. Test the Server

From a browser:

```
http://localhost:3000/jump
```

Or from terminal:

```bash
curl http://localhost:3000/jump
```

Both will broadcast a "jump" message to any connected WebSocket client.

---

## 💡 Integration in the Game

In your `Player.js`, add this inside the constructor:

```js
const socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
  console.log("✅ Connected to WebSocket server");
};

socket.onmessage = (event) => {
  if (event.data === "jump") {
    this.jumpPressed = true;
    setTimeout(() => {
      this.jumpPressed = false;
    }, 100);
  }
};
```

Make sure you're inside the class and `this.jumpPressed` is defined.

---

## 📱 Remote Device Trigger (e.g., unPhone)

Use this code on the unPhone to send a jump trigger:

```cpp
client.print("GET /jump HTTP/1.1\r\nHost: <your-laptop-ip>:3000\r\n\r\n");
```

Replace `<your-laptop-ip>` with your actual IP (e.g. `192.168.0.42`). Ensure both devices are on the same network.

---

Enjoy real-time jumping with your custom Dino controller! 🦖🏃
