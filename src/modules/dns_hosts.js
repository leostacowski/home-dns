import { dns_servers } from '@common/configs.js'

export const DNSHosts = () => {
  const randomServer = dns_servers[Math.floor(Math.random() * dns_servers.length)]

  return {
    targetServers: dns_servers,
    randomServer,
  }
}
