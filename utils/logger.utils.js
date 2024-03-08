const path = require('node:path');
const pino = require('pino-http');

const isProd = process.env.NODE_ENV === 'production';

const customLogLevel = (_req, res, err) => {
  if (res.statusCode >= 400 && res.statusCode < 500) {
    return 'warn';
  } else if (res.statusCode >= 500 || err) {
    return 'error';
  } else if (res.statusCode >= 300 && res.statusCode < 400) {
    return 'silent';
  }
  return 'info';
};

const devConfig = {
  transport: {
    target: 'pino-pretty',
  },
  serializers: {
    req: function asReqValue(req) {
      return {
        method: req.method,
        url: req.url,
        query: req.query,
        hostname: req.hostname,
      };
    },
    err: pino.stdSerializers.err,
    res: function asResValue(reply) {
      return {
        statusCode: reply.statusCode,
      };
    },
  },
  customLogLevel,
  customSuccessMessage(req, res) {
    if (res.statusCode === 404) {
      return 'resource not found';
    }
    return `${req.method} completed`;
  },
  customReceivedMessage(req) {
    return `request received: ${req.method}`;
  },
  customErrorMessage(_req, res) {
    return `request errored with status code: ${res.statusCode}`;
  },
};

const getFilePath = () => {
  const directoryPath = './logs';
  const dateLog = new Date().toISOString().slice(0, 10);
  const filePath = path.join(directoryPath, `log-file-${dateLog}.log`);
  return filePath;
};

const prodLogger = {
  transport: {
    target: 'pino/file',
    options: { destination: getFilePath(), mkdir: isProd },
  },
};

const configLogger = isProd ? prodLogger : devConfig;

const logger = pino(configLogger);
module.exports = logger;
