import { createSocket } from 'dgram'
import { Logger } from '@common/logger.js'
import { udp_proxy_address, udp_proxy_port, udp_proxy_timeout } from '@common/configs.js'

export const Listener = ({
  requestWorkerResponse = () => {},
  onConnectionStart = () => {},
  onConnectionEnd = () => {},
}) => {
  const logger = Logger(`udp_proxy_listener`)
  const server = createSocket('udp4')

  let listening = false

  server.on('listening', () => {
    logger.info(`Server is ready for requests`)
    listening = true
  })

  server.on('error', (error) => {
    logger.error(`Server error: ${error?.message || JSON.stringify(error)}`)
    process.exit(1)
  })

  server.on('message', async (message, reqInfo) => {
    try {
      const { address: reqAddress, port: reqPort } = reqInfo
      const id = Math.floor(Math.random() * Date.now())

      onConnectionStart(id, Date.now())

      const workerResponse = await requestWorkerResponse(id, message)
      server.send(workerResponse, reqPort, reqAddress)

      onConnectionEnd(id, Date.now())
    } catch (exception) {
      logger.warn(`Socket exception: ${exception?.message || JSON.stringify(exception)}`)
    }
  })

  server.bind({
    address: udp_proxy_address,
    port: udp_proxy_port,
  })

  setTimeout(() => {
    if (!listening) {
      logger.error(`Server timeout`)
      process.exit(1)
    }
  }, udp_proxy_timeout)
}
