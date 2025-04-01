import { fork, isPrimary } from 'cluster'
import { TCPProxy, TCPWorker } from '@modules/tcp_proxy'
import { UDPProxy, UDPWorker } from '@modules/udp_proxy'
import { proxy_workers_count, dns_servers } from '@common/configs.js'

const parentProcess = () => {
  const workers = []

  for (let cProcessIdx = 0; cProcessIdx < proxy_workers_count; cProcessIdx++) {
    workers.push(fork())
  }

  const udpProxy = UDPProxy()
  const tcpProxy = TCPProxy()

  Promise.all([udpProxy.start(workers), tcpProxy.start(workers)])
}

const childProcess = () => {
  Promise.all([UDPWorker(), TCPWorker()])
}

if (isPrimary) parentProcess()
else childProcess()
