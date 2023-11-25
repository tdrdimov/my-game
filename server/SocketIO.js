const { Server: SocketIOServer } = require('socket.io')
const RoomManager = require('./RoomManager')

class SocketIO {
  constructor() {
    this.io = null
    this.roomManager = new RoomManager()
    this.players = new Map()
  }

  configureServer(server) {
    this.io = new SocketIOServer(server.httpServer, {
      cors: {
        origin: '*',
      },
      path: '/socket.io',
    })

    this.io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        this.roomManager.leaveRoom(socket)
        this.players.delete(socket.id)
      })

      socket.on('join-room', (roomName) => {
        const room = this.roomManager.createRoom(roomName, socket)

        if (!this.players.has(socket.id)) {
          this.players.set(socket.id, { x: 0, y: 0, z: 0 })
          socket.emit('current-players', Array.from(this.players.entries()))
        }

        if (this.roomManager.joinRoom(socket, roomName)) {
          socket.emit('joined-room', roomName)

          this.io.to(roomName).emit('player-joined', socket.id)
        } else {
          socket.emit('room-full')
        }
      })

      socket.on('player-moved', (playerId, newState) => {
        if (this.players.has(playerId)) {
          this.players.set(playerId, newState)
        }
        socket.to(socket.room).emit('player-moved', playerId, newState)
      })

      socket.on('player-moving', (playerId, newState) => {
        socket.to(socket.room).emit('player-moving', playerId, newState)
      })

      socket.on('shoot-spell', (playerId, spellInfo) => {
        socket.to(socket.room).emit('shoot-spell', playerId, spellInfo)
      })

      socket.on('player-jump', (playerId) => {
        socket.to(socket.room).emit('player-jump', playerId)
      })

      socket.on('receive-damage', (playerId) => {
        socket.to(socket.room).emit('receive-damage', playerId)
      })

      socket.on('leave-room', () => {
        this.roomManager.leaveRoom(socket)
        this.players.delete(socket.id)
      })
    })
  }
}

module.exports = SocketIO
