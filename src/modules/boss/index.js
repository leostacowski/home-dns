import cluster from 'node:cluster'
import { DNS } from './dns/index.js'

export class Boss {
  constructor() {
    this.dns = new DNS()
    this.forkWorkers()
  }

  setListeners(worker) {
    worker.on('message', ({ type, ...content }) => {
      switch (type) {
        case 'dns_server_hit':
          return this.dns.onHit(content)
        case 'dns_server_emit':
          return this.dns.emit()
        default:
          return null
      }
    })
  }

  forkWorkers() {
    for (let wIdx = 0; wIdx < WORKER_COUNT; wIdx++) {
      this.setListeners(cluster.fork())
    }
  }
}
