const express = require('express')
const http = require('http')
const path = require('path')
const cors = require('cors')
const SocketIO = require('./SocketIO') // Adjust the path accordingly

const app = express()

// Enable CORS
app.use(cors())

// Serve your Three.js app from the 'dist' directory
const staticPath = path.join(__dirname, '../dist')
app.use(express.static(staticPath))

const server = http.createServer(app)
// Use the SocketIOPlugin to configure Socket.io
const socketIOPlugin = new SocketIO()
socketIOPlugin.configureServer({ httpServer: server })

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
