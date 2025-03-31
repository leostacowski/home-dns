import { fork } from 'child_process'

// fork(`dist/udp_proxy.bundle.js`, {
//   shell: true,
// })

const tcpWorker = fork(`dist/tcp_proxy_worker.bundle.js`, {
  shell: true,
})

import { TCPProxy } from '@modules/tcp_proxy'

TCPProxy(tcpWorker).start()
