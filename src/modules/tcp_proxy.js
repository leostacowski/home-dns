import { createServer, createConnection } from 'net'
import { DNSHosts } from '@modules/dns_hosts'
import { Logger } from '@common/logger.js'
import { tcp_proxy } from '@config'

const TCPProxy = () => {
  const logger = Logger(`${tcp_proxy.address}:${tcp_proxy.port}/tcp`)

  const server = createServer()

  server.listen({
    host: tcp_proxy.address,
    port: tcp_proxy.port,
  })

  const getResponse = async (reqData) => {
    try {
      let response = null

      const getRequest = ({ address: rserver_address, port: rserver_port }) =>
        new Promise((resolve) => {
          const client = createConnection({
            port: rserver_port,
            host: rserver_address,
          })

          let errored = false

          client.write(reqData)

          client.on('error', (error) => {
            logger.error(`Client error: ${error?.message || JSON.stringify(error)}`)
            errored = true
          })

          client.on('data', (resData) => {
            response = resData
          })

          const interval = setInterval(() => {
            if (response || errored) {
              client.end()
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

  const proxyRequest = (reqSocket) => {
    const startTime = Date.now()

    const logDuration = () => {
      const duration = Date.now() - startTime
      logger.info(`Request ended in [${duration}] ms`)
    }

    try {
      reqSocket.on('data', async (reqData) => {
        const resMessage = await getResponse(reqData)

        reqSocket.write(resMessage)
        reqSocket.end()
      })

      reqSocket.on('error', (error) => {
        logger.error(`Request error: ${error?.message || JSON.stringify(error)}`)
        reqSocket.end()
      })

      reqSocket.on('end', () => {
        logDuration()
      })
    } catch (exception) {
      logger.error(
        `Proxy request error: ${exception?.message || JSON.stringify(exception)}`,
      )

      logDuration()

      reqSocket.end()
    }
  }

  try {
    server.on('listening', () => {
      logger.info(`Server listening`)
    })

    server.on('error', (error) => {
      logger.error(`Server error: ${error?.message || JSON.stringify(error)}`)
    })

    server.on('connection', proxyRequest)
  } catch (exception) {
    logger.error(`Unexpected error: ${exception?.message || JSON.stringify(exception)}`)
  }
}

TCPProxy()
