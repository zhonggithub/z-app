import dotenv from 'dotenv';

// istanbul ignore next
if (process.env.NODE_ENV === 'dev') {
  dotenv.config({
    path: `${__dirname}/../.env`,
  });
}

// istanbul ignore next
if (process.env.NODE_ENV === 'test') {
  process.env = {
    ...process.env,
    APP_NAME: 'test',
    APP_PREFIX: '/group/public/',
    NODE_ENV: 'test',
    PORT: 3001,
    LOG_LEVEL: 'fatal',
    MONGO_DB: 'mongodb://127.0.0.1/hms-order-test',
    JWT_KEY: 'hms-group-console-server',
  };
}
