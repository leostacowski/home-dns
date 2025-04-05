import { fork } from 'cluster'
import { listeners_count } from '@common/configs.js'
import { Messenger } from '@core/modules/event_handler'
import { DNSServers } from '@modules/dns_servers'

export const ParentProcess = () => {
  const dnsServers = DNSServers()

  const onDNSServerHit = (workerMessenger, { address, delay }) => {
    dnsServers.registerHit(address, delay)
    workerMessenger.send('set_target_servers', { targetServers: dnsServers.getServers() })
  }

  const start = () => {
    for (let workerIdx = 0; workerIdx < listeners_count; workerIdx++) {
      const worker = fork()
      const workerMessenger = Messenger(worker)

      worker.on('online', () =>
        workerMessenger
          .send('set_target_servers', { targetServers: dnsServers.getServers() })
          .then(() => workerMessenger.send('start'))
      )

      workerMessenger.on('hit', (payload) => onDNSServerHit(workerMessenger, payload))
    }
  }

  return {
    start,
  }
}
