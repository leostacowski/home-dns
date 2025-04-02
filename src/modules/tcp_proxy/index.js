import { Listener } from '@modules/tcp_proxy/modules/listener'
import { Logger } from '@common/logger.js'
import { DNSHosts } from '@modules/dns_hosts'
import { tcp_proxy_timeout } from '@common/configs.js'

export { TCPWorker } from '@modules/tcp_proxy/modules/worker'

export const TCPProxy = () => {
  const dnsHosts = DNSHosts()
  const logger = Logger('tcp_proxy')
  const connections = {}

  let workers = []

  const requestWorkerResponse = async (requestId, requestData) => {
    const randomWorker = workers[Math.floor(Math.random() * workers.length)]
    const encodedRequestData = Buffer.from(requestData).toString('binary')
    const { targetServers } = dnsHosts

    let workerResponse = ''

    targetServers.forEach((dnsServerAddress) =>
      randomWorker.send({
        type: 'tcp_request',
        id: requestId,
        address: dnsServerAddress,
        requestData: encodedRequestData,
      }),
    )

    await new Promise((resolve) => {
      let timeout = null

      const messageHandler = ({ id, response, address, port }) => {
        if (id === requestId && !workerResponse && response) {
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
      }, tcp_proxy_timeout)
    })

    return workerResponse
  }

  const onConnectionStart = (id, startTime) => {
    connections[id] = {
      startTime,
    }
  }

  const onConnectionEnd = (id, endTime) => {
    if (connections?.[id]) {
      const { startTime, address } = connections[id]
      const proxiedAddress = address ? ` [${address}]` : ''
      const delay = endTime - startTime

      dnsHosts.registerHit(address, delay)

      logger.info(`Proxy request${proxiedAddress} ended in ${delay}ms`)

      delete connections[id]
    }
  }

  const start = (workerSets) => {
    logger.info(`Starting listener`)

    workers = workerSets

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
