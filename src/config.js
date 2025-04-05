import { availableParallelism } from 'os'
import { resolve } from 'path'

export default {
  setup: () => {
    global.DNS_SERVERS = [
      '94.140.14.14',
      '8.8.8.8',
      '1.1.1.1',
      '9.9.9.9',
      '208.67.222.222',
      '76.76.2.0',
      '119.29.29.29',
    ]
    global.IS_WINDOWS = process.platform === 'win32'
    global.WORKER_COUNT = IS_WINDOWS ? 1 : availableParallelism() * 2
    global.SERVER_TIMEOUT = 1000
    global.SERVER_HOST_ADDRESS = IS_WINDOWS ? '127.0.0.1' : '0.0.0.0'
    global.SERVER_HOST_PORT = 53
    global.STORAGE_DIR = resolve(process.cwd(), './.storage')
  },
}
