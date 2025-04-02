import { dns_servers } from '@common/configs.js'

export const DNSHosts = () => {
  const hits = {}

  const getters = {
    get randomServer() {
      return dns_servers[Math.floor(Math.random() * dns_servers.length)]
    },
    get targetServers() {
      return dns_servers
    },
  }

  const registerHit = (host, avg) => {
    const record = hits[host] || {
      hits: 0,
      avg: 0,
    }

    record.hits += 1
    record.avg = (record.hits * record.avg + avg) / (record.hits + 1)

    hits[host] = record
  }

  return {
    registerHit,
    ...getters,
  }
}
