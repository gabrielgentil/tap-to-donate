import pino from 'pino';

// Configuração do logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  base: {
    service: 'tap-to-donate',
    environment: process.env.NODE_ENV || 'development',
  },
});

// Tipos de log
export interface LogContext {
  [key: string]: any;
}

// Funções de log com contexto
export const logInfo = (message: string, context?: LogContext) => {
  logger.info({ ...context }, message);
};

export const logError = (message: string, error?: Error, context?: LogContext) => {
  logger.error({ 
    error: error?.message, 
    stack: error?.stack,
    ...context 
  }, message);
};

export const logWarn = (message: string, context?: LogContext) => {
  logger.warn({ ...context }, message);
};

export const logDebug = (message: string, context?: LogContext) => {
  logger.debug({ ...context }, message);
};

// Logger para funções específicas
export const createFunctionLogger = (functionName: string) => {
  return {
    info: (message: string, context?: LogContext) => 
      logInfo(message, { function: functionName, ...context }),
    error: (message: string, error?: Error, context?: LogContext) => 
      logError(message, error, { function: functionName, ...context }),
    warn: (message: string, context?: LogContext) => 
      logWarn(message, { function: functionName, ...context }),
    debug: (message: string, context?: LogContext) => 
      logDebug(message, { function: functionName, ...context }),
  };
};

export default logger; 