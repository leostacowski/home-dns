import { createSocket } from 'dgram'
import { Logger } from '@common/logger.js'

export const UDPWorker = () => {
  const logger = Logger(`udp_proxy_worker_${process.pid}`)

  logger.info(`Worker is ready`)

  const getResponse = ({ type, id, address, requestData }) => {
    if (type !== 'udp_request') return

    try {
      requestData = Buffer.from(requestData, 'binary')
      const [serverAddress, serverPort = 53] = address.split(':')
      const client = createSocket('udp4')

      client.on('message', (resMessage) => {
        process.send({
          id,
          address,
          response: Buffer.from(resMessage).toString('binary'),
        })

        client.close()
      })

      client.on('error', () => {
        client.close()
      })

      client.send(requestData, serverPort, serverAddress)
    } catch (exception) {
      logger.error(`Worker exception: ${exception?.message || JSON.stringify(exception)}`)
    }
  }

  process.on('message', getResponse)
}
