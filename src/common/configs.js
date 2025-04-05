import { cpus } from 'os'
import { resolve } from 'path'

export const dns_servers = [
  '94.140.14.14',
  '8.8.8.8',
  '1.1.1.1',
  '9.9.9.9',
  '208.67.222.222',
  '76.76.2.0',
  '119.29.29.29',
]

export const udp_server_timeout = 1000

export const is_windows = process.platform === 'win32'

export const udp_server_bind_address = is_windows ? '127.0.0.1' : '0.0.0.0'

export const udp_server_bind_port = 53

export const logger_path = resolve(process.cwd(), './.logs')

export const storage_path = resolve(process.cwd(), './.storage')

export const listeners_count = is_windows ? 1 : cpus().length * 2
