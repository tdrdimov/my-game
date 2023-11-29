// RoomManager.js
class RoomManager {
  constructor() {
    this.rooms = new Map()
  }

  createRoom(roomName, socket, maxPlayers = 2) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, {
        players: new Set(),
        maxPlayers
      })
    }
    this.joinRoom(socket, roomName)
    return this.rooms.get(roomName)
  }

  joinRoom(socket, roomName) {
    const room = this.rooms.get(roomName)
    if (room && room.players.size < room.maxPlayers) {
      socket.join(roomName)
      room.players.add(socket.id)
      socket.room = roomName
      return true
    }
    return false
  }

  leaveRoom(socket) {
    const roomName = socket.room
    if (roomName) {
      socket.leave(roomName)
      const room = this.rooms.get(roomName)
      if (room) {
        room.players.delete(socket.id)
        if (room.players.size === 0) {
          this.rooms.delete(roomName)
        }
      }
    }
  }

  getRoomBySocket(socket) {
    for (const [roomName, room] of this.rooms) {
      if (room.players.has(socket.id)) {
        return roomName
      }
    }
    return null
  }
}

module.exports = RoomManager
