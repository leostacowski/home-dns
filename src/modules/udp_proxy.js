import { createSocket } from 'dgram'
import { DNSHosts } from '@modules/dns_hosts'
import { Logger } from '@common/logger.js'
import { udp_proxy } from '@config'

const UDPProxy = () => {
  const logger = Logger(`${udp_proxy.address}:${udp_proxy.port}/udp`)

  const server = createSocket('udp4')

  server.bind({
    address: udp_proxy.address,
    port: udp_proxy.port,
  })

  const getResponse = async (reqMessage) => {
    try {
      let response = null

      const getRequest = ({ address: rserver_address, port: rserver_port }) =>
        new Promise((resolve) => {
          const client = createSocket('udp4')
          let errored = false

          client.send(reqMessage, rserver_port, rserver_address)

          client.on('message', (resMessage) => {
            response = resMessage
          })

          client.on('error', (error) => {
            logger.error(`Client error: ${error?.message || JSON.stringify(error)}`)
            errored = true
          })

          const interval = setInterval(() => {
            if (response || errored) {
              client.close()
              resolve(null)
              clearInterval(interval)
            }
          }, 1)
        })

      const { target_servers } = DNSHosts()
      await Promise.all(target_servers.map(getRequest))

      return response
    } catch (exception) {
      const errorMsg = exception?.message || JSON.stringify(exception)

      logger.error(`Proxy request error: ${errorMsg}`)

      return null
    }
  }

  const proxyRequest = async (reqMessage, reqInfo) => {
    const startTime = Date.now()
    const { address: reqAddress, port: reqPort } = reqInfo

    const logDuration = () => {
      const duration = Date.now() - startTime
      logger.info(`Request ended in [${duration}] ms`)
    }

    try {
      const resMessage = await getResponse(reqMessage)

      server.send(resMessage, reqPort, reqAddress)

      logDuration()
    } catch (exception) {
      const errorMsg = exception?.message || JSON.stringify(exception)

      logger.error(`Proxy request error: ${errorMsg}`)

      logDuration()

      server.send(errorMsg, reqPort, reqAddress)
    }
  }

  try {
    server.on('listening', () => {
      logger.info(`Server listening`)
    })

    server.on('error', (error) => {
      logger.error(`Server error: ${error?.message || JSON.stringify(error)}`)
    })

    server.on('message', proxyRequest)
  } catch (exception) {
    logger.error(`Unexpected error: ${exception?.message || JSON.stringify(exception)}`)
  }
}

UDPProxy()
