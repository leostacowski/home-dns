export const Messenger = (messenger = process) => {
  const proc = messenger
  const handlers = {}

  proc.on('message', ({ type, ...content }) => {
    if (handlers?.[type]?.length) handlers[type].forEach((handler) => handler(content))
  })

  const on = (handler = '', onData = () => {}) => {
    handlers[handler] = handlers[handler] || []
    handlers[handler].push(onData)
  }

  const send = (handler = '', data = {}) =>
    new Promise((resolve) => {
      proc.send(
        {
          type: handler,
          ...data,
        },
        resolve
      )
    })

  return {
    on,
    send,
  }
}
