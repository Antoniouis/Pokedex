const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const routes = require('./routes');
const socketHandler = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// REST API
app.use('/api', routes);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

socketHandler(io);

const PORT = 3001;

// Expose server to local network by using 0.0.0.0
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
