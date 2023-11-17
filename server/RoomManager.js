// RoomManager.js
class RoomManager {
    constructor() {
      this.rooms = new Map();
      this.MAX_PLAYERS_PER_ROOM = 2;
    }
  
    createRoom(roomName) {
      if (!this.rooms.has(roomName)) {
        this.rooms.set(roomName, new Set());
      }
      return this.rooms.get(roomName);
    }
  
    joinRoom(socket, roomName) {
      const room = this.rooms.get(roomName);
      if (room && room.size < this.MAX_PLAYERS_PER_ROOM) {
        socket.join(roomName);
        room.add(socket.id);
        socket.room = roomName;
        return true;
      }
      return false;
    }
  
    leaveRoom(socket) {
      const roomName = socket.room;
      if (roomName) {
        socket.leave(roomName);
        const playersInRoom = this.rooms.get(roomName);
        if (playersInRoom) {
          playersInRoom.delete(socket.id);
          if (playersInRoom.size === 0) {
            this.rooms.delete(roomName);
          }
        }
      }
    }
  }
  
  export default RoomManager;
  