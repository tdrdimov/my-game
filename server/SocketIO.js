const { Server: SocketIOServer } = require('socket.io')
const RoomManager = require('./RoomManager')

class SocketIO {
  constructor() {
    this.io = null
    this.roomManager = new RoomManager()
    this.players = new Map()
  }

  addPlayerToRoom(socket, roomName) {
    if (this.roomManager.joinRoom(socket, roomName)) {
      let playerPosition
      if (this.players.size === 0) {
        playerPosition = -50 // Position for the first player
        socket.emit('waiting-for-second-player') // Emit the waiting event to the first player
      } else if (this.players.size === 1) {
        playerPosition = 50 // Position for the second player
        setTimeout(() => {
          this.io.to(roomName).emit('start-game') // Emit the start event to both players after a delay
        }, 3000)
      }
      const playerPositionData = {
        position: { x: playerPosition, y: 0, z: 0 }
      }
      if (!this.players.has(socket.id)) {
        this.players.set(socket.id, playerPositionData)
        socket.emit('current-players', Array.from(this.players.entries()))
      }

      socket.emit('joined-room', roomName)

      this.io.to(roomName).emit('player-joined', socket.id, playerPositionData)
    } else {
      socket.emit('room-full', this.players)
    }
  }

  configureServer(server) {
    this.io = new SocketIOServer(server.httpServer, {
      cors: {
        origin: '*'
      },
      path: '/socket.io'
    })

    this.io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        this.roomManager.leaveRoom(socket)
        this.players.delete(socket.id)
      })

      socket.on('create-room', (roomName) => {
        if (!this.roomManager.rooms.has(roomName)) {
          this.roomManager.createRoom(roomName, socket)
          this.addPlayerToRoom(socket, roomName)
        } else {
          socket.emit('room-exist')
        }
      })

      socket.on('join-room', (roomName) => {
        this.addPlayerToRoom(socket, roomName)
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
