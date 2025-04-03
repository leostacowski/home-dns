import { Storage } from '@common/storage.js'
import { dns_servers } from '@common/configs.js'

export const DNSServers = () => {
  const hitsStorage = Storage({ label: 'dns_servers_hits' })
  const hits = hitsStorage.list() || {}

  let targetServers = [...dns_servers]

  const updateTargetServers = () => {
    targetServers = targetServers.sort((sA, sB) => {
      const getWeight = (host) => {
        const record = hits?.[host] || {}
        const sum = Number(record.lastDelay) + Number(record.avg)

        return isNaN(sum) || sum <= 0 ? 0 : sum
      }

      const weightA = getWeight(sA)
      const weightB = getWeight(sB)

      if (weightA === weightB) return 0
      if (!weightA) return 1
      if (!weightB) return -1

      return weightA - weightB
    })
  }

  const registerHit = (host, delay) => {
    const record = hits[host] || {
      hits: 0,
      avg: 0,
    }

    record.avg = Math.round(((record.hits || 1) * record.avg + delay) / (record.hits + 1))
    record.hits += 1
    record.lastDelay = delay

    hits[host] = record
    hitsStorage.set(host, record)
    updateTargetServers()
  }

  updateTargetServers()

  return {
    registerHit,
    getServers: () => targetServers,
  }
}
