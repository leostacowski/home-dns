import { fork, isPrimary } from 'cluster'
import { TCPProxy, TCPWorker } from '@modules/tcp_proxy'
import { UDPProxy, UDPWorker } from '@modules/udp_proxy'
import { DNSProxy } from '@modules/dns_proxy'
import { proxy_workers_count } from '@common/configs.js'

const parentProcess = () => {
  const dnsProxy = DNSProxy()
  const udpProxy = UDPProxy(dnsProxy)
  const tcpProxy = TCPProxy(dnsProxy)
  const workers = []

  for (let cProcessIdx = 0; cProcessIdx < proxy_workers_count; cProcessIdx++) {
    workers.push(fork())
  }

  Promise.all([udpProxy.start(workers), tcpProxy.start(workers)])

  process.on('SIGINT', () => {
    process.exit(0)
  })
}

const childProcess = () => Promise.all([UDPWorker(), TCPWorker()])

if (isPrimary) parentProcess()
else childProcess()
