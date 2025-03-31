import { dns_servers } from '@config'

export const DNSHosts = () => {
  const random_server = dns_servers[Math.floor(Math.random() * dns_servers.length)]

  return {
    target_servers: dns_servers,
    random_server,
  }
}
