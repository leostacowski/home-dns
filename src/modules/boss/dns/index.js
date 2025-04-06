import cluster from 'node:cluster'
import { Cache } from '../cache/index.js'

export class DNS {
  constructor() {
    this.memCache = new Cache({ prune: true })
    this.servers = [...DNS_SERVERS]
  }

  onHit({ key, response }) {
    this.memCache.set(key, response)
    this.emit()
  }

  emit() {
    for (const { process: worker } of Object.values(cluster.workers)) {
      worker.send({
        type: 'dns_server_emit',
        servers: this.servers,
        memCache: this.memCache.list(),
      })
    }
  }
}
