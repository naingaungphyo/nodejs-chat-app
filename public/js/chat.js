const socket = io()

// socket.on('countUpdated', (count) => {
//   console.log('The count has been updated!', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked')
//   socket.emit('increment')
// })

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// templates variables
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  // New emessage element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    console.log($messages.scrollTop)
    console.log('value', $messages.scrollHeight)
    $messages.scrollTop = $messages.scrollHeight
    console.log('result', $messages.scrollTop)
    console.log($messages.scrollHeight)
  }

  // console.log('containerHeight:', containerHeight)
  // console.log('scrollTop:', $messages.scrollTop)
  // console.log('scrollOffset:', scrollOffset)
  // console.log('scrollHeight:', $messages.scrollHeight)
}

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A')
  }) // first parameter is template, second parameter is object, to be rendered in template
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h: mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()

  // disable button
  $messageFormButton.setAttribute('disabled', 'disabled')

  // const message = document.querySelector('input').value
  const message = e.target.elements.message.value
  socket.emit('sendMessage', message, (error) => {
    // enable button
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if (error) {
      return console.log(error)
    }
    console.log('Message delivered!')
  }) // parameters are (event, event payload object, event acknowledgements)
})

document.querySelector('#send-location').addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }
  $sendLocationButton.setAttribute('disabled', 'disabled')
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      (message) => {
        $sendLocationButton.removeAttribute('disabled')
        console.log('Location shared!')
      }
    )
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})
