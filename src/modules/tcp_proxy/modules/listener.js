import { createServer } from 'net'
import { Logger } from '@common/logger.js'
import { tcp_proxy } from '@config'

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
  })

  server.on('connection', (requestSocket) => {
    const connectionId = Math.floor(Math.random() * Date.now())

    onConnectionStart(connectionId, Date.now())

    requestSocket.setTimeout(tcp_proxy.socketTTL)

    requestSocket.on('data', async (requestData) => {
      try {
        const response = await requestWorkerResponse(connectionId, requestData)

        requestSocket.write(response)
        requestSocket.end()
      } catch (exception) {
        logger.error(`Socket error: ${exception?.message || JSON.stringify(exception)}`)
        requestSocket.end()
      }
    })

    requestSocket.on('error', (error) => {
      logger.error(`Socket error: ${error?.message || JSON.stringify(error)}`)
      requestSocket.end()
    })

    requestSocket.on('timeout', () => {
      logger.warn(`Socket timeout`)
      requestSocket.end()
    })

    requestSocket.on('end', () => {
      onConnectionEnd(connectionId, Date.now())
      requestSocket.destroy()
    })
  })

  server.listen({
    host: tcp_proxy.address,
    port: tcp_proxy.port,
    reusePort: true,
  })
}

export default Listener
