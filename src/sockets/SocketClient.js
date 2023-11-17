import io from 'socket.io-client';

export default class SocketClient {
  constructor() {
    this.socket = io();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
    //   console.log('Connected to Socket.IO server');

      // Example: Join a room
      this.socket.emit('join-room', 'room1');
    });

    // Event listener for when the user has joined a room
    this.socket.on('joined-room', (room) => {
      console.log(`Joined room: ${room}`);
    });

    // Event listener for when the room is full
    this.socket.on('room-full', () => {
      console.log('The room is full. Unable to join.');
    });

    // Event listener for when a new player joins the room
    this.socket.on('player-joined', (playerId) => {
      console.log(`Player ${playerId} joined the room`);
    });

    // Event listener for when a player leaves the room
    this.socket.on('player-left', (playerId) => {
      console.log(`Player ${playerId} left the room`);
    });
  }

  // You can add more methods for emitting events or additional logic as needed
}
