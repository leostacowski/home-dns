export class Worker {
  constructor() {
    setTimeout(() => {
      process.send({ type: 'dns_server_hit', message: 'Server HIT!!' })
      process.send({ type: 'dns_server_list', message: 'Server LIST!!' })
    }, 1000)
  }
}
