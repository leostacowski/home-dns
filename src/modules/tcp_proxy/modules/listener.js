import { createServer } from 'net'
import { Logger } from '@common/logger.js'
import { tcp_proxy_address, tcp_proxy_port } from '@common/configs.js'

export const Listener = ({
  requestWorkerResponse = () => {},
  onConnectionStart = () => {},
  onConnectionEnd = () => {},
}) => {
  const logger = Logger(`tcp_proxy_listener`)
  const server = createServer()

  server.on('listening', () => {
    logger.info(`Server is ready for requests`)
  })

  server.on('error', (error) => {
    logger.error(`Server error: ${error?.message || JSON.stringify(error)}`)
    process.exit(1)
  })

  server.on('connection', (requestSocket) => {
    try {
      const id = Math.floor(Math.random() * Date.now())

      onConnectionStart(id, Date.now())

      requestSocket.on('data', async (requestData) => {
        const workerResponse = await requestWorkerResponse(id, requestData)
        requestSocket.write(workerResponse)
      })

      requestSocket.on('error', (error) => {
        logger.error(`Socket error: ${error?.message || JSON.stringify(error)}`)
      })

      requestSocket.on('end', () => {
        onConnectionEnd(id, Date.now())
      })
    } catch (exception) {
      logger.error(`Socket exception: ${exception?.message || JSON.stringify(exception)}`)
    }
  })

  server.listen({
    host: tcp_proxy_address,
    port: tcp_proxy_port,
  })
}

export default Listener
