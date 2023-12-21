import io from 'socket.io-client'

export default class SocketClient {
  constructor() {
    const serverUrl =
      process.env.NODE_ENV === 'production'
        ? window.location.origin // Replace with your actual Vercel app domain
        : 'http://127.0.0.1:5173/' // Your local development server URL

    this.socket = io(serverUrl, {
      path: '/socket.io'
    })
    this.setupEventListeners()
    this.setupErrorHandling()
  }

  getSocket() {
    return this.socket
  }

  setupEventListeners() {
    const room = localStorage.getItem('room')
    const playerName = localStorage.getItem('playerName')

    this.socket.on('connect', () => {
      document.getElementById('create_game').addEventListener('click', () => {
        const room = document.querySelector('input[name="create game"]').value
        const playerName = document.getElementById('player_name_create').value
        if (room) {
          this.socket.emit('create-room', room, playerName)
        }
      })

      document.getElementById('join_game').addEventListener('click', () => {
        const room = document.querySelector('input[name="join game"]').value
        const playerName = document.getElementById('player_name_join').value
        if (room) {
          this.socket.emit('join-room', room, playerName)
        }
      })

      if (room && playerName) {
        this.socket.emit('create-room', room, playerName)
      }
    })

    // Event listener for when the user has joined a room
    this.socket.on('joined-room', (room) => {
      window.history.pushState({}, '', '?room=' + room)
      document.getElementById('ui').style.display = 'none'
      localStorage.removeItem('room')
      localStorage.removeItem('playerName')
    })

    // Event listener for when the room is full
    this.socket.on('room-full', () => {
      alert('The room is full. Unable to join.')
    })

    this.socket.on('room-exist', () => {
      if (room && playerName) {
        this.socket.emit('join-room', room, playerName)
        return
      }
      alert('This room already exist. Try joining it or think of another room name.')
    })

    // Event listener for when a player leaves the room
    // this.socket.on('player-left', (playerId) => {
    //   console.log(`Player ${playerId} left the room`)
    // })
  }

  setupErrorHandling() {
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    this.socket.on('disconnect', (reason) => {
      console.error('Socket disconnected:', reason)
    })
  }
}
