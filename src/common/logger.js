import { createLogger, transports, format } from 'winston'
import { resolve } from 'path'
import { logger_path } from '@common/configs.js'

const loggerDir = resolve(logger_path)

const logDirDateName = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}-${month}-${day}`
}

export const Logger = (loggerLabel = '') => {
  const { combine, timestamp, label, printf, json } = format

  const getMessage = (message) =>
    typeof message !== 'string' ? JSON.stringify(message) : message

  const logFormat = ({ level, message, label, timestamp }) =>
    `${timestamp} [${label}] ${level}: '${getMessage(message)}'`

  return createLogger({
    transports: [
      new transports.Console({
        level: 'info',
        format: combine(label({ label: loggerLabel }), timestamp(), printf(logFormat)),
      }),
      new transports.File({
        level: 'error',
        filename: `${loggerDir}/errors/${logDirDateName()}/errors.log`,
        format: combine(label({ label: loggerLabel }), timestamp(), json(logFormat)),
      }),
    ],
  })
}