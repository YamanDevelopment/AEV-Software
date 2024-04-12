import { SerialPort } from 'serialport'

// Create a port
const port = new SerialPort({
  path: 'COM3',
  baudRate: 115200,
})

port.write('help', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
  })

  port.on('data', function (data) {
    console.log('Data:', data)
  })
  