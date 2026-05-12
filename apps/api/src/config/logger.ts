import pino from 'pino'
import { env } from './env'

const isDevelopment = env.NODE_ENV === 'development'

export const logger = pino(
  {
    level: isDevelopment ? 'debug' : 'info',
    formatters: {
      level(label) {
        return { level: label }
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isDevelopment
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      })
    : undefined,
)
