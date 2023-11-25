// import { Server as SocketIOServer } from 'socket.io';
// import RoomManager from './RoomManager';

// write pure node code to require the imported modules
const { Server: SocketIOServer } = require('socket.io')
const RoomManager = require('./RoomManager')

class SocketIOPlugin {
  constructor() {
    this.io = null
    this.roomManager = new RoomManager()
    this.players = new Map()
  }

  configureServer(server) {
    this.io = new SocketIOServer(server.httpServer, {
      cors: {
        origin: '*'
      },
      path: '/socket.io'
    })

    this.io.on('connection', (socket) => {
      // Handle user disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })

      // Handle user joining a room
      socket.on('join-room', (roomName) => {
        this.handleJoinRoom(socket, roomName)
      })

      // Handle player movement
      socket.on('player-moved', (playerId, newState) => {
        this.handlePlayerMoved(socket, playerId, newState)
      })

      // Handle other events...

      // Handle leaving a room
      socket.on('leave-room', () => {
        this.handleLeaveRoom(socket)
      })
    })
  }

  handleDisconnect(socket) {
    this.roomManager.leaveRoom(socket)
    this.players.delete(socket.id)
  }

  handleJoinRoom(socket, roomName) {
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
  }

  handlePlayerMoved(socket, playerId, newState) {
    if (this.players.has(playerId)) {
      this.players.set(playerId, newState)
    }
    socket.to(socket.room).emit('player-moved', playerId, newState)
  }

  // Add other event handlers as needed...

  handleLeaveRoom(socket) {
    this.roomManager.leaveRoom(socket)
    this.players.delete(socket.id)
  }
}

module.exports = SocketIOPlugin;

// export default function createSocketIOPlugin() {
//   const socketIOPlugin = new SocketIOPlugin()

//   return {
//     name: 'socket-io-plugin',
//     configureServer: socketIOPlugin.configureServer.bind(socketIOPlugin)
//   }
// }
