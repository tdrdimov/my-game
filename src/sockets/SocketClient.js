import io from 'socket.io-client'

export default class SocketClient {
  constructor() {
    const serverUrl =
      process.env.NODE_ENV === 'production'
        ? window.location.origin // Replace with your actual Vercel app domain
        : 'http://127.0.0.1:5173/' // Your local development server URL

    this.socket = io(serverUrl, {
      path: '/socket.io',
    })
    this.setupEventListeners()
    this.setupErrorHandling()
  }

  getSocket() {
    return this.socket
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      document.getElementById('create_game').addEventListener('click', () => {
        const room = document.querySelector('input[name="create game"]').value
        if (room) {
          this.socket.emit('create-room', room)
        }
      })
      
      document.getElementById('join_game').addEventListener('click', () => {
        const room = document.querySelector('input[name="join game"]').value
        if (room) {
          this.socket.emit('join-room', room)
        }
      })
    })

    // Event listener for when the user has joined a room
    this.socket.on('joined-room', (room) => {
      window.history.pushState({}, '', '?room=' + room)
      document.getElementById('ui').style.display = 'none'
    })

    // Event listener for when the room is full
    this.socket.on('room-full', () => {
      alert('The room is full. Unable to join.')
    })

    this.socket.on('room-exist', () => {
      alert('This room already exist. Try joining it or think of another room name.')
    })

    // Event listener for when a player leaves the room
    // this.socket.on('player-left', (playerId) => {
    //   console.log(`Player ${playerId} left the room`)
    // })
  }

  setupErrorHandling() {
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.error('Socket disconnected:', reason);
    });
  }
}
