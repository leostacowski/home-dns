import cluster from 'node:cluster'

export class Boss {
  constructor() {
    this.forkWorkers()
  }

  registerDNSHit(worker, content) {
    console.log(content)
  }

  listDnsServers(worker, content) {
    console.log(content)
  }

  setListeners(worker) {
    worker.on('message', ({ type, ...content }) => {
      switch (type) {
        case 'dns_server_hit':
          return this.registerDNSHit(worker, content)
        case 'dns_server_list':
          return this.listDnsServers(worker, content)
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
