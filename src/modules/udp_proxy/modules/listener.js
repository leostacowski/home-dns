import { createSocket } from 'dgram'
import { Logger } from '@common/logger.js'
import { udp_proxy } from '@common/configs.js'

export const Listener = ({
  requestWorkerResponse = () => {},
  onConnectionStart = () => {},
  onConnectionEnd = () => {},
}) => {
  const logger = Logger(`udp_proxy_listener`)
  const server = createSocket('udp4')

  server.on('listening', () => {
    logger.info(`Server is ready for requests`)
  })

  server.on('error', (error) => {
    logger.error(`Server error: ${error?.message || JSON.stringify(error)}`)
  })

  server.on('message', async (message, reqInfo) => {
    const { address: reqAddress, port: reqPort } = reqInfo
    const connectionId = Math.floor(Math.random() * Date.now())

    onConnectionStart(connectionId, Date.now())

    const response = await requestWorkerResponse(connectionId, message)

    server.send(response, reqPort, reqAddress)

    onConnectionEnd(connectionId, Date.now())
  })

  server.bind({
    address: udp_proxy.address,
    port: udp_proxy.port,
  })
}
