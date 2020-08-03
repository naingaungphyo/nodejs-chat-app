const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')

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

  socket.emit('message', 'Welcome!') // socket.emit is sending to current socket only
  socket.broadcast.emit('message', 'A new user has joined!') // broadcast is sending event to all other users except current one

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    io.emit('message', message) // io.emit is sending to all sockets
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    callback()
  })

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left') // cant use socket.emit here because client is already disconnected here
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})
