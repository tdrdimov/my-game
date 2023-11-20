import io from 'socket.io-client'

export default class SocketClient {
  constructor() {
    this.socket = io()
    this.setupEventListeners()
  }

  getSocket() {
    return this.socket
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      this.socket.emit('join-room', 'room1')
    })

    // Event listener for when the user has joined a room
    this.socket.on('joined-room', (room) => {
      // console.log(`Joined room: ${room}`)
      window.history.pushState({}, '', '?room=' + room)
    })

    // Event listener for when the room is full
    this.socket.on('room-full', () => {
      console.log('The room is full. Unable to join.')
    })

    // Event listener for when a player leaves the room
    // this.socket.on('player-left', (playerId) => {
    //   console.log(`Player ${playerId} left the room`)
    // })
  }
}
