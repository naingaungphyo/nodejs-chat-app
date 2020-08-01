const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 2000

app.disable('x-powered-by')
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count = 0

io.on('connection', (socket) => {
  // socket is object
  console.log('New WebSocket connection')

  // socket.emit('countUpdated', count)

  // socket.on('increment', () => {
  //   count++
  //   // socket.emit('countUpdated', count)
  //   io.emit('countUpdated', count)
  // })

  socket.emit('message', 'Welcome!')
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})
