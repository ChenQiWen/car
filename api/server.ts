/**
 * local server entry file, for local development
 */
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { setupWebSocket } from './websocket/socketHandler.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

// 创建HTTP服务器
const server = createServer(app);

// 创建Socket.io服务器
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// 设置WebSocket处理
setupWebSocket(io);

server.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`WebSocket server is running`);
  console.log('Ready for connections!');
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;