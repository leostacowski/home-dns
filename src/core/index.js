import dotenv from 'dotenv'
import child_process from 'child_process'
import path from 'path'
import { TCPProxy } from '@modules/tcp_proxy'
import { UDPProxy } from '@modules/udp_proxy'
import { proxy_workers_count } from '@common/configs.js'

dotenv.config()

const Core = async () => {
  const tcpWorkers = []
  const udpWorkers = []

  for (let i = 0; i < proxy_workers_count; i++) {
    tcpWorkers[i] = child_process.fork(
      `${path.resolve(process.cwd(), 'dist/tcp_proxy_worker.bundle.js')}`,
    )

    udpWorkers[i] = child_process.fork(
      `${path.resolve(process.cwd(), 'dist/udp_proxy_worker.bundle.js')}`,
    )
  }

  TCPProxy(tcpWorkers).start()
  UDPProxy(udpWorkers).start()
}

Core()
