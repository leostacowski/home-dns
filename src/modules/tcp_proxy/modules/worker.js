import { createConnection } from 'net'
import { Logger } from '@common/logger.js'

export const TCPWorker = () => {
  const logger = Logger(`tcp_proxy_worker_${process.pid}`)

  logger.info(`Worker is ready`)

  const getResponse = ({ type, id, address, requestData }) => {
    if (type !== 'tcp_request') return

    try {
      requestData = Buffer.from(requestData, 'binary')
      const [serverAddress, serverPort = 53] = address.split(':')

      const client = createConnection({
        port: serverPort,
        host: serverAddress,
      })

      client.on('data', (resData) => {
        process.send({
          id,
          address,
          response: Buffer.from(resData).toString('binary'),
        })
      })

      client.write(requestData)
    } catch (exception) {
      logger.error(`Worker exception: ${exception?.message || JSON.stringify(exception)}`)
    }
    
  }

  process.on('message', getResponse)
}
