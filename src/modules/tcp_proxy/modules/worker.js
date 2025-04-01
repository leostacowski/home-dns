import { createConnection } from 'net'
import { Logger } from '@common/logger.js'

const Worker = () => {
  const logger = Logger(`tcp_proxy_worker_${process.pid}`)

  logger.info(`Worker is ready`)

  const getResponse = ({ connectionId, address, port, requestData }) => {
    requestData = Buffer.from(requestData, 'hex')

    const client = createConnection({
      port,
      host: address,
    })

    client.on('data', (resData) => {
      process.send({
        connectionId,
        address,
        port,
        response: Buffer.from(resData).toString('hex'),
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
