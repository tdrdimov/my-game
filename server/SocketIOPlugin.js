import { Server as SocketIOServer } from 'socket.io'
import RoomManager from './RoomManager'
import * as THREE from 'three'

class SocketIOPlugin {
  constructor() {
    this.io = null
    this.roomManager = new RoomManager()
    this.players = new Map()
  }

  configureServer(server) {
    this.io = new SocketIOServer(server.httpServer)

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
        // console.log(`Player ${playerId} moved ${newState}`)
        if (this.players.has(playerId)) {
          this.players.set(playerId, newState)
        }
        socket.to(socket.room).emit('player-moved', playerId, newState)
      })

      socket.on('shoot-spell', (playerId, spellInfo) => {
        socket.to(socket.room).emit('shoot-spell', playerId, spellInfo);
      });

      socket.on('leave-room', () => {
        this.roomManager.leaveRoom(socket)
        this.players.delete(socket.id)
      })
    })
  }
}

export default function createSocketIOPlugin() {
  const socketIOPlugin = new SocketIOPlugin()

  return {
    name: 'socket-io-plugin',
    configureServer: socketIOPlugin.configureServer.bind(socketIOPlugin)
  }
}
