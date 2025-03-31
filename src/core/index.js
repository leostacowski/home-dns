import { fork } from 'child_process'

fork(`dist/tcp_proxy.bundle.js`, {
  shell: true,
})

fork(`dist/udp_proxy.bundle.js`, {
  shell: true,
})
