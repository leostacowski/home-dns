import { fork } from 'child_process'
import { TCPProxy } from '@modules/tcp_proxy'
import { UDPProxy } from '@modules/udp_proxy'
import { proxy_workers_count } from '@common/configs.js'

const Core = async () => {
  const tcpWorkers = []
  const udpWorkers = []

  for (let i = 0; i < proxy_workers_count; i++) {
    tcpWorkers.push(fork(`dist/tcp_proxy_worker.bundle.js`, { shell: true }))
    udpWorkers.push(fork(`dist/udp_proxy_worker.bundle.js`, { shell: true }))
  }

  TCPProxy(tcpWorkers).start()
  UDPProxy(udpWorkers).start()
}

Core()
