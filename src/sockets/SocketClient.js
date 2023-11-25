import io from 'socket.io-client'

export default class SocketClient {
  constructor() {
    const serverUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://wizard-duel-9mwyte1h6-tdrdimov.vercel.app/' // Replace with your actual Vercel app domain
        : 'http://127.0.0.1:5173/' // Your local development server URL

    this.socket = io(serverUrl)
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
