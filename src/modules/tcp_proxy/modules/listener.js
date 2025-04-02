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
  })

  server.on('connection', (requestSocket) => {
    const id = Math.floor(Math.random() * Date.now())

    onConnectionStart(id, Date.now())

    requestSocket.on('data', async (requestData) => {
      try {
        requestWorkerResponse(id, requestData).then((response) => {
          requestSocket.write(response)
        })
      } catch (exception) {
        logger.error(`Socket error: ${exception?.message || JSON.stringify(exception)}`)
      }
    })

    requestSocket.on('error', (error) => {
      logger.error(`Socket error: ${error?.message || JSON.stringify(error)}`)
    })

    requestSocket.on('end', () => {
      onConnectionEnd(id, Date.now())
      requestSocket.destroy()
    })
  })

  server.listen({
    host: tcp_proxy_address,
    port: tcp_proxy_port,
  })
}

export default Listener
