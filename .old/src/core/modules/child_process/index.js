import { Messenger } from '@core/modules/event_handler'
import { UDPServer } from '@modules/udp_server'

export const ChildProcess = () => {
  const messenger = Messenger()
  let dnsServersList = []

  const setTargetServers = ({ targetServers = [] }) => {
    dnsServersList = targetServers
  }

  const getTargetServers = () => {
    return dnsServersList
  }

  const onConnectionEnd = (chosenAddress, delay) => {
    messenger.send('hit', { address: chosenAddress, delay })
  }

  const onStart = () => {
    const udpServer = UDPServer()

    udpServer.start()
    udpServer.serve(getTargetServers, onConnectionEnd)
  }

  const start = () => {
    messenger.on('set_target_servers', setTargetServers)
    messenger.on('start', onStart)
  }

  return {
    start,
  }
}
