import { Listener } from '@modules/tcp_proxy/modules/listener'
import { Logger } from '@common/logger.js'
import { DNSHosts } from '@modules/dns_hosts'
import { tcp_proxy } from '@config'

export const TCPProxy = (tcpWorker) => {
  const dnsHosts = DNSHosts()
  const logger = Logger('tcp_proxy')
  const connections = {}

  const requestWorkerResponse = async (requestId, requestData) => {
    const { target_servers } = dnsHosts
    const encodedRequestData = Buffer.from(requestData).toString('binary')

    let workerResponse = ''

    target_servers.forEach((dns_server) =>
      tcpWorker.send({
        connectionId: requestId,
        address: dns_server.address,
        port: dns_server.port,
        requestData: encodedRequestData,
      }),
    )

    await new Promise((resolve) => {
      let timeout = null

      const messageHandler = ({ connectionId, response, address, port }) => {
        if (connectionId === requestId && !workerResponse && response) {
          workerResponse = Buffer.from(response, 'binary')

          resolve(null)

          if (connections?.[requestId])
            connections[requestId] = {
              ...connections[requestId],
              address,
              port,
            }

          tcpWorker.removeListener('message', messageHandler)
          clearTimeout(timeout)
        }
      }

      tcpWorker.on('message', messageHandler)

      timeout = setTimeout(() => {
        resolve(null)
        tcpWorker.removeListener('message', messageHandler)
      }, tcp_proxy.workerTTL)
    })

    return workerResponse
  }

  const onConnectionStart = (connectionId, startTime) => {
    connections[connectionId] = {
      startTime,
    }
  }

  const onConnectionEnd = (connectionId, endTime) => {
    if (connections?.[connectionId]) {
      const { startTime, address, port } = connections[connectionId]
      const proxiedAddress = address && port ? ` [${address}:${port}]` : ''

      logger.info(`Proxy request${proxiedAddress} ended in ${endTime - startTime}ms`)

      delete connections[connectionId]
    }
  }

  const start = () => {
    logger.info(`Starting listener`)

    Listener({
      requestWorkerResponse,
      onConnectionStart,
      onConnectionEnd,
    })
  }

  return {
    start,
  }
}

export default TCPProxy
