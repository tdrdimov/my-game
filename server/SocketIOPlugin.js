// SocketIOPlugin.js
import { Server as SocketIOServer } from 'socket.io';
import RoomManager from './RoomManager';

class SocketIOPlugin {
  constructor() {
    this.io = null;
    this.roomManager = new RoomManager();
  }

  configureServer(server) {
    this.io = new SocketIOServer(server.httpServer);

    this.io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('disconnect', () => {
        console.log('User disconnected');
        this.roomManager.leaveRoom(socket);
      });

      socket.on('join-room', (roomName) => {
        const room = this.roomManager.createRoom(roomName);

        if (this.roomManager.joinRoom(socket, roomName)) {
          socket.emit('joined-room', roomName);
          socket.to(roomName).emit('player-joined', socket.id);
        } else {
          socket.emit('room-full');
        }
      });

      socket.on('custom-event', (data) => {
        console.log('Received:', data);
        this.io.to(socket.room).emit('custom-event', { message: `Hello from room ${socket.room}!` });
      });
    });

    console.log('Socket.IO server initialized');
  }
}

export default SocketIOPlugin;
