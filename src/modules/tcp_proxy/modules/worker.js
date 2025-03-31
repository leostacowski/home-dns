import { createConnection } from 'net'
import { Logger } from '@common/logger.js'

const Worker = () => {
  const logger = Logger(`tcp_proxy_worker_${process.pid}`)

  logger.info(`Worker is ready for requests`)

  const getResponse = ({ connectionId, address, port, requestData }) => {
    requestData = Buffer.from(requestData, 'binary')

    const client = createConnection({
      port,
      host: address,
    })

    client.on('data', (resData) => {
      process.send({
        connectionId,
        address,
        port,
        response: Buffer.from(resData).toString('binary'),
      })

      client.end()
    })

    client.on('error', () => {
      client.end()
    })

    client.on('end', () => {
      client.destroy()
    })

    client.write(requestData)
  }

  process.on('message', getResponse)
}

Worker()
