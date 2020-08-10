const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

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

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options })
    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Admin', 'Welcome')) // socket.emit is sending to current socket only
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`)) // broadcast is sending event to all other users except current one

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    io.to(user.room).emit('message', generateMessage(user.username, message)) // io.emit is sending to all sockets
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    )
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left`)) // cant use socket.emit here because client is already disconnected here
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})

// socket.emit  specific client
// io.emit every connected clients
// socket.broadcast.emit every connected same socket clients
// io.to(room_variable).emit everyone in specific room
// socket.broadcast.to(room_variable).emit everyone in specific room except self
