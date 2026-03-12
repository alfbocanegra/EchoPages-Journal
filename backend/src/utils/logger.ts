import winston from 'winston';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type LogMetadata = Record<string, unknown>;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

export function log(level: LogLevel, message: string, metadata?: LogMetadata): void {
  logger.log(level, message, metadata);
}

export function error(message: string, metadata?: LogMetadata): void {
  logger.error(message, metadata);
}

export function warn(message: string, metadata?: LogMetadata): void {
  logger.warn(message, metadata);
}

export function info(message: string, metadata?: LogMetadata): void {
  logger.info(message, metadata);
}

export function debug(message: string, metadata?: LogMetadata): void {
  logger.debug(message, metadata);
}

export function createLogger(name: string) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: name },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),
    ],
  });
}

export default logger;
