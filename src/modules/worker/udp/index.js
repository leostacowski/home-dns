import dgram from 'dgram'
import { Logger } from '../../logger/index.js'

export class UDP {
  constructor() {
    this.logger = new Logger(`udp_${process.pid}`)
    this.servers = [...DNS_SERVERS]
    this.memCache = {}

    this.server = dgram.createSocket({
      type: 'udp4',
      recvBufferSize: 3000,
      sendBufferSize: 3000,
      lookup: (hostname, _options, callback) => {
        callback(null, hostname, 'IPv4')
      },
    })

    this.#listen()
    this.#serve()
  }

  #listen() {
    process.send({ type: 'dns_server_emit' })

    process.on('message', ({ type, ...content }) => {
      switch (type) {
        case 'dns_server_emit': {
          const { servers, memCache } = content || {}

          this.servers = servers
          this.memCache = memCache

          break
        }
        default:
          return null
      }
    })
  }

  #serve() {
    let listening = false

    this.server.on('listening', () => {
      this.logger.info(`Server is ready for requests`)
      listening = true
    })

    this.server.on('error', (error) => {
      this.logger.error(`Server error: ${error?.message || JSON.stringify(error)}`)
      process.exit(1)
    })

    this.server.on('message', (message, req) => {
      this.#onMessage(message, req)
    })

    this.server.bind({
      address: SERVER_HOST_ADDRESS,
      port: SERVER_HOST_PORT,
      exclusive: IS_WINDOWS,
    })

    setTimeout(() => {
      if (!listening) {
        this.logger.error(`Server timeout`)
        process.exit(1)
      }
    }, SERVER_TIMEOUT)
  }

  #getRequestCacheDataFromMessage(message) {
    let requestKey = []

    for (let byte of message) {
      const char = Buffer.from([byte]).toString('latin1')

      if (/[a-z]/.test(char)) {
        requestKey.push(char)
      }
    }

    requestKey = requestKey.join('')

    if (this.memCache?.[requestKey]?.value) {
      return {
        response: Buffer.from(this.memCache[requestKey].value, 'binary'),
        key: requestKey,
      }
    }

    return {
      response: null,
      key: requestKey,
    }
  }

  async #onMessage(message, { address: reqAddress, port: reqPort }) {
    const startTime = Date.now()

    try {
      let { response, key } = this.#getRequestCacheDataFromMessage(message)

      if (response) {
        this.logger.info(`Cache hit: '${key}' in ${Date.now() - startTime}ms`)

        return this.server.send(response, reqPort, reqAddress)
      }

      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          this.logger.error(`Client socket timeout`)
          resolve(null)
        }, SERVER_TIMEOUT)

        for (let serverIdx = 0; serverIdx < this.servers.length; serverIdx++) {
          const [serverAddress, serverPort = 53] = this.servers[serverIdx].split(':')
          const client = dgram.createSocket('udp4')

          client.on('message', (resMessage) => {
            if (!response) {
              response = resMessage
              clearTimeout(timeout)
              resolve(null)

              this.logger.info(
                `Client socket response: '${serverAddress}:${serverPort}' in ${
                  Date.now() - startTime
                }ms`,
              )

              process.send({
                type: 'dns_server_hit',
                address: this.servers[serverIdx],
                delay: Date.now() - startTime,
                key,
                response,
              })
            } else {
              client.close()
            }
          })

          client.on('error', (exception) => {
            this.logger.warn(
              `Client socket error: ${exception?.message || JSON.stringify(exception)}`,
            )

            client.close()
          })

          client.send(message, serverPort, serverAddress)
        }
      })

      this.server.send(response, reqPort, reqAddress)
    } catch (exception) {
      this.logger.warn(
        `Server socket exception: ${exception?.message || JSON.stringify(exception)}`,
      )
    }
  }
}
