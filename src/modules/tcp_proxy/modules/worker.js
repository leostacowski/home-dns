import { createConnection } from 'net'
import { Logger } from '@common/logger.js'

export const TCPWorker = () => {
  const logger = Logger(`tcp_proxy_worker_${process.pid}`)

  logger.info(`Worker is ready`)

  const getResponse = ({ type, id, address, requestData }) => {
    if (type !== 'tcp_request') return

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
