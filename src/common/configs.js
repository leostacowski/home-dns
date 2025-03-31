export const dns_servers = [
  {
    address: '94.140.14.14',
    port: 53,
  },
  {
    address: '8.8.8.8',
    port: 53,
  },
  {
    address: '1.1.1.1',
    port: 53,
  },
  {
    address: '9.9.9.9',
    port: 53,
  },
  {
    address: '208.67.222.222',
    port: 53,
  },
  {
    address: '76.76.2.0',
    port: 53,
  },
  {
    address: '119.29.29.29',
    port: 53,
  },
]

export const tcp_proxy = {
  workerTTL: 2000,
  address: '127.0.0.1',
  port: 53,
}

export const udp_proxy = {
  workerTTL: 2000,
  address: '127.0.0.1',
  port: 53,
}

export default {
  tcp_proxy,
  udp_proxy,
  dns_servers,
}
