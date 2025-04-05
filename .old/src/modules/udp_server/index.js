import { createSocket } from 'dgram'
import { Logger } from '@common/logger.js'
import {
  udp_server_bind_address,
  udp_server_bind_port,
  udp_server_timeout,
  is_windows,
} from '@common/configs.js'

export const UDPServer = () => {
  const logger = Logger(`udp_server_${process.pid}`)

  const server = createSocket({
    type: 'udp4',
    recvBufferSize: 3000,
    sendBufferSize: 3000,
  })

  const serve = (getDNSServers = () => {}, registerHit = () => {}) => {
    server.on('message', async (reqData, { address: reqAddress, port: reqPort }) => {
      const startTime = Date.now()
      let chosenAddress = null

      try {
        const dnsServers = getDNSServers()
        let response = null

        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            logger.error(`Client socket timeout`)
            resolve(null)
          }, udp_server_timeout)

          for (let serverIdx = 0; serverIdx < dnsServers.length; serverIdx++) {
            const [serverAddress, serverPort = 53] = dnsServers[serverIdx].split(':')
            const client = createSocket('udp4')

            client.on('message', (resMessage) => {
              if (!response) {
                response = resMessage
                chosenAddress = dnsServers[serverIdx]

                clearTimeout(timeout)
                resolve(null)
              } else {
                client.close()
              }
            })

            client.on('error', (exception) => {
              logger.warn(
                `Client socket error: ${exception?.message || JSON.stringify(exception)}`,
              )

              client.close()
            })

            client.send(reqData, serverPort, serverAddress)
          }
        })

        server.send(response, reqPort, reqAddress)
      } catch (exception) {
        logger.warn(
          `Server socket exception: ${exception?.message || JSON.stringify(exception)}`,
        )
      } finally {
        if (chosenAddress) {
          const delay = Date.now() - startTime

          logger.info(`DNS server hit: ${chosenAddress} in ${delay}ms`)

          registerHit(chosenAddress, delay)
        }
      }
    })
  }

  const start = () => {
    let listening = false

    server.on('listening', () => {
      logger.info(`Server is ready for requests`)
      listening = true
    })

    server.on('error', (error) => {
      logger.error(`Server error: ${error?.message || JSON.stringify(error)}`)
      process.exit(1)
    })

    server.bind({
      address: udp_server_bind_address,
      port: udp_server_bind_port,
      exclusive: is_windows,
    })

    setTimeout(() => {
      if (!listening) {
        logger.error(`Server timeout`)
        process.exit(1)
      }
    }, udp_server_timeout)
  }

  return {
    start,
    serve,
  }
}
