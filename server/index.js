// server/index.js
const express = require('express')
const http = require('http')
const path = require('path')
const cors = require('cors')
const SocketIOPlugin = require('./SocketIOPlugin') // Adjust the path accordingly

const app = express()
app.use(cors())
const server = http.createServer(app)

// Use the SocketIOPlugin to configure Socket.io
const socketIOPlugin = new SocketIOPlugin()
socketIOPlugin.configureServer({ httpServer: server })

// Serve your Three.js app from the 'dist' directory
const staticPath = path.join(__dirname, '../dist')
app.use(express.static(staticPath))

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
