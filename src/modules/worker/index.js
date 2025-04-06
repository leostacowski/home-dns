import { UDP } from './udp/index.js'

export class Worker {
  constructor() {
    this.udp = new UDP()
  }
}
