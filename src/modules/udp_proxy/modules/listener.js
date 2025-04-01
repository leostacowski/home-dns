import { createSocket } from 'dgram'
import { Logger } from '@common/logger.js'
import { udp_proxy_address, udp_proxy_port } from '@common/configs.js'

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

  server.on('message', (message, reqInfo) => {
    const { address: reqAddress, port: reqPort } = reqInfo
    const id = Math.floor(Math.random() * Date.now())

    onConnectionStart(id, Date.now())

    requestWorkerResponse(id, message).then((response) => {
      server.send(response, reqPort, reqAddress)

      onConnectionEnd(id, Date.now())
    })
  })

  server.bind({
    address: udp_proxy_address,
    port: udp_proxy_port,
  })
}
