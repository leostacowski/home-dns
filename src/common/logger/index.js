import { createLogger, transports, format } from 'winston'
import { storage_dir } from '../../config.js'

export class Logger {
  constructor(loggerLabel = '') {
    return createLogger({
      transports: [
        this.getConsoleLogTransport(loggerLabel),
        this.getFileErrorLogTransport(loggerLabel),
      ],
    })
  }

  getDirName(date = new Date()) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}_${month}_${day}`
  }

  getFormattedMessage({ level, message: rawMessage, label, timestamp }) {
    const msg = typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage)

    return `${timestamp} [${label}] ${level}: '${msg}'`
  }

  getConsoleLogTransport(loggerLabel) {
    const { combine, timestamp, label, printf } = format

    return new transports.Console({
      level: 'info',
      format: combine(
        label({ label: loggerLabel }),
        timestamp(),
        printf(this.getFormattedMessage),
      ),
    })
  }

  getFileErrorLogTransport(loggerLabel) {
    const { combine, timestamp, label, json } = format

    return new transports.File({
      level: 'error',
      filename: `${storage_dir}/winston/${this.getDirName()}/errors.log`,
      format: combine(
        label({ label: loggerLabel }),
        timestamp(),
        json(this.getFormattedMessage),
      ),
    })
  }
}
