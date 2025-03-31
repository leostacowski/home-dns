const {
  DNS_SERVERS,
  PROXY_WORKERS_COUNT,
  TCP_PROXY_TIMEOUT,
  TCP_PROXY_ADDRESS,
  TCP_PROXY_PORT,
  UDP_PROXY_TIMEOUT,
  UDP_PROXY_ADDRESS,
  UDP_PROXY_PORT,
} = process.env

export const dns_servers = String(DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',')

export const proxy_workers_count = Number(PROXY_WORKERS_COUNT || '2')

export const tcp_proxy_timeout = Number(TCP_PROXY_TIMEOUT || '1000')

export const tcp_proxy_address = String(TCP_PROXY_ADDRESS || '127.0.0.1')

export const tcp_proxy_port = Number(TCP_PROXY_PORT || '53')

export const udp_proxy_timeout = Number(UDP_PROXY_TIMEOUT || '1000')

export const udp_proxy_address = String(UDP_PROXY_ADDRESS || '127.0.0.1')

export const udp_proxy_port = Number(UDP_PROXY_PORT || '53')
