import { fork } from 'child_process'
import { cpus } from 'os'
import { TCPProxy } from '@modules/tcp_proxy'
import { UDPProxy } from '@modules/udp_proxy'

const Core = async () => {
  const workerCount = new Array(Math.ceil(cpus().length / 2)).fill(true)

  const tcpWorkers = await Promise.all(
    workerCount.map(() =>
      fork(`dist/tcp_proxy_worker.bundle.js`, {
        shell: true,
      }),
    ),
  )

  TCPProxy(tcpWorkers).start()

  const udpWorkers = await Promise.all(
    workerCount.map(() =>
      fork(`dist/udp_proxy_worker.bundle.js`, {
        shell: true,
      }),
    ),
  )

  UDPProxy(udpWorkers).start()
}

Core()
