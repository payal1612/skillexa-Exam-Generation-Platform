const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';

const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const getTimestamp = () => new Date().toISOString();

const formatLog = (level, message, data) => {
  const timestamp = getTimestamp();
  const colorCode = {
    ERROR: colors.red,
    WARN: colors.yellow,
    INFO: colors.blue,
    DEBUG: colors.cyan,
  }[level] || colors.reset;

  let logMessage = `${colorCode}[${timestamp}] [${level}] ${message}${colors.reset}`;

  if (data) {
    logMessage += `\n${JSON.stringify(data, null, 2)}`;
  }

  return logMessage;
};

export const logger = {
  error: (message, data) => {
    console.error(formatLog(logLevels.ERROR, message, data));
  },
  warn: (message, data) => {
    console.warn(formatLog(logLevels.WARN, message, data));
  },
  info: (message, data) => {
    console.log(formatLog(logLevels.INFO, message, data));
  },
  debug: (message, data) => {
    if (isDevelopment) {
      console.log(formatLog(logLevels.DEBUG, message, data));
    }
  },
};
