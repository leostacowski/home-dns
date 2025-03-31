import { Listener } from '@modules/udp_proxy/modules/listener'
import { Logger } from '@common/logger.js'
import { DNSHosts } from '@modules/dns_hosts'
import { udp_proxy } from '@common/configs.js'

export const UDPProxy = (udpWorkers) => {
  const dnsHosts = DNSHosts()
  const logger = Logger('udp_proxy')
  const connections = {}

  const requestWorkerResponse = async (requestId, requestData) => {
    const randomWorker = udpWorkers[Math.floor(Math.random() * udpWorkers.length)]
    const encodedRequestData = Buffer.from(requestData).toString('binary')
    const { target_servers } = dnsHosts

    let workerResponse = ''

    target_servers.forEach((dns_server) =>
      randomWorker.send({
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

          if (connections?.[requestId])
            connections[requestId] = {
              ...connections[requestId],
              address,
              port,
            }

          randomWorker.removeListener('message', messageHandler)
          clearTimeout(timeout)
          resolve(null)
        }
      }

      randomWorker.on('message', messageHandler)

      timeout = setTimeout(() => {
        randomWorker.removeListener('message', messageHandler)
        resolve(null)
      }, udp_proxy.workerTTL)
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
