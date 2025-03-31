export const dns_servers = [
  {
    name: 'dns.adguard.com',
    address: '94.140.14.14',
    port: 53,
  },
  {
    name: 'dns.google',
    address: '8.8.8.8',
    port: 53,
  },
  {
    name: 'dns.cloudflare',
    address: '1.1.1.1',
    port: 53,
  },
  {
    name: 'dns.quad9.net',
    address: '9.9.9.9',
    port: 53,
  },
  {
    name: 'doh.opendns',
    address: '208.67.222.222',
    port: 53,
  },
  {
    name: 'freedns.controld',
    address: '76.76.2.0',
    port: 53,
  },
  {
    name: 'dns.pub',
    address: '119.29.29.29',
    port: 53,
  },
]

export const tcp_proxy = {
  address: '0.0.0.0',
  port: 53,
}

export const udp_proxy = {
  address: '0.0.0.0',
  port: 53,
}

export const cache_config = {
  stdTTL: 60,
  checkperiod: 10,
}

export default {
  tcp_proxy,
  udp_proxy,
  dns_servers,
  cache_config,
}
