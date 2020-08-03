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

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

socket.on('message', (message) => {
  console.log(message)
  const html = Mustache.render(messageTemplate, {
    message
  }) // second parameter is object, to be rendered in template
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (url) => {
  console.log(url)
  const html = Mustache.render(locationTemplate, {
    url
  })
  $messages.insertAdjacentHTML('beforeend', html)
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
