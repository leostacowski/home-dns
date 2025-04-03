import { cpus } from 'os'
import { resolve } from 'path'

const {
  DNS_SERVERS,
  LISTENERS_COUNT,
  UDP_SERVER_TIMEOUT,
  UDP_SERVER_BIND_ADDRESS,
  UDP_SERVER_BIND_PORT,
  STORAGE_PATH,
  LOGS_PATH,
} = process.env

export const dns_servers = String(DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',')

export const listeners_count = Number(LISTENERS_COUNT || cpus().length)

export const udp_server_timeout = Number(UDP_SERVER_TIMEOUT || '1000')

export const udp_server_bind_address = String(UDP_SERVER_BIND_ADDRESS || '0.0.0.0')

export const udp_server_bind_port = Number(UDP_SERVER_BIND_PORT || '53')

export const logger_path = resolve(process.cwd(), String(LOGS_PATH || './.logs'))

export const storage_path = resolve(process.cwd(), String(STORAGE_PATH || './.storage'))
