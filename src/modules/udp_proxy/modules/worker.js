import { createSocket } from 'dgram'
import { Logger } from '@common/logger.js'

const Worker = () => {
  const logger = Logger(`udp_proxy_worker_${process.pid}`)

  logger.info(`Worker is ready`)

  const getResponse = ({ connectionId, address, port, requestData }) => {
    requestData = Buffer.from(requestData, 'binary')

    const client = createSocket('udp4')

    client.on('message', (resMessage) => {
      process.send({
        connectionId,
        address,
        port,
        response: Buffer.from(resMessage).toString('binary'),
      })

      client.close()
    })

    client.on('error', () => {
      client.close()
    })

    client.send(requestData, port, address)
  }

  process.on('message', getResponse)
}

Worker()
