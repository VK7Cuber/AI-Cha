export const serverConfig = {
  port: Number(process.env.PORT || 8080),
  host: '0.0.0.0',
  logLevel: process.env.LOG_LEVEL || 'info'
};

