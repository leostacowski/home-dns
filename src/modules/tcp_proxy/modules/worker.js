import { createConnection } from 'net'

const Worker = ({ connectionId, address, port, requestData }) => {
  requestData = Buffer.from(requestData, 'binary')

  const client = createConnection({
    port,
    host: address,
  })

  client.write(requestData)

  client.on(
    'data',
    (resData) =>
      process.send({
        connectionId,
        address,
        port,
        response: Buffer.from(resData).toString('binary'),
      }),

    client.end(),
  )

  client.on('error', () => {
    client.end()
  })

  client.on('end', () => {
    client.destroy()
  })
}

process.on('message', Worker)
