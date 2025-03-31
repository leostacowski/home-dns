import { createLogger, transports, format } from 'winston'

export const Logger = (loggerLabel = '') => {
  const { combine, timestamp, label, printf, json } = format

  const getMessage = (message) =>
    typeof message !== 'string' ? JSON.stringify(message) : message

  const logFormat = ({ level, message, label, timestamp }) =>
    `${timestamp} [${label}] ${level}: '${getMessage(message)}'`

  const logDirPath = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `logs/${year}-${month}-${day}`
  }

  return createLogger({
    transports: [
      new transports.Console({
        level: 'info',
        format: combine(label({ label: loggerLabel }), timestamp(), printf(logFormat)),
      }),
      new transports.File({
        level: 'error',
        filename: `${logDirPath()}/error.log`,
        format: combine(label({ label: loggerLabel }), timestamp(), json(logFormat)),
      }),
    ],
  })
}

export default Logger
