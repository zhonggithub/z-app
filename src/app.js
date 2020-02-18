/**
 * File: app.js
 * Project: app
 * FilePath: /src/app.js
 * Created Date: 2019-10-21 15:06:58
 * Author: Zz
 * -----
 * Last Modified: 2019-12-28 15:58:53
 * Modified By: Zz
 * -----
 * Description:
 */

import Koa from 'koa';
import koaStaticCache from 'koa-static-cache';
import compress from 'koa-compress';
import cors from 'koa2-cors';
import session from 'koa-session';
import lodash from 'lodash';
import io from 'socket.io-client';
import koaBunyanLogger, { bunyan } from 'koa-bunyan-logger';
import uuidv1 from 'uuid/v1';
import './env';
import config from './config';
import Seneca from 'seneca-extended'; // eslint-disable-line
import { RedisStore, Cache } from './lib';
import router from './router';

const app = new Koa();
app.keys = ['u&^%$9*&#sdq05Y$wyvb'];

const cache = new Cache();

const logger = bunyan.createLogger({
  name: config.appName,
  level: config.logLevel,
  serializers: bunyan.stdSerializers,
});

const websocket = `http://${config.websocket.host}:${config.websocket.port}?type=${config.websocket.type}&visitorID=${uuidv1()}`;
const socket = io(websocket, { transports: ['websocket'] });
socket.on('connect', () => {
  logger.info('socket.io connect success.');
});
socket.on('disconnect', () => logger.warn('socket.io disconnect.'));
socket.on('error', (error) => logger.error(`socket.io error: ${error.toString()}`));

// 加入服务
const service = {};
lodash.each(config.service, (v, k) => {
  if (v !== '') {
    const tmp = v.split(':');
    if (tmp.length === 2) {
      const tmpService = Seneca({
        logLevel: 'info',
        timeout: 15000,
        tag: `service-${k}`,
      });
      tmpService.client({
        type: 'http',
        host: tmp[0],
        port: tmp[1],
        history: {
          active: false,
        },
      });
      service[k] = tmpService;
      logger.info(`add service:${k} => ${v}`);
    }
  }
});

const sessionConfig = {
  key: config.session.prefix,
  maxAge: 2 * 60 * 60 * 1000,
  autoCommit: true,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: true,
  store: new RedisStore(),
};

app.use(cors())
  .use(koaStaticCache(`${__dirname}/public/`, {
    prefix: config.appPrefix,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  }))
  .use(compress({
    filter: (contentType) => /text/i.test(contentType),
    threshold: 1024,
    flush: require('zlib').Z_SYNC_FLUSH,
  }))
  .use(session(sessionConfig, app))
  .use(koaBunyanLogger({
    name: config.appName,
    level: config.logLevel,
  }))
  .use(koaBunyanLogger.requestIdContext())
  .use(koaBunyanLogger.requestLogger({ ignorePath: ['/ping'] }));

app.use(async (ctx, next) => {
  ctx.service = service;
  ctx.logger = logger;
  ctx.socketio = socket;
  ctx.cache = cache;
  await next();
});

// 加入中间件
if (config.middleware && config.middleware.length > 0) {
  config.middleware.forEach((item) => {
    app.use(require(`./midleware/${item}.js`));
  });
}

app.proxy = true;
router(app);

export default app;

if (!module.parent) {
  logger.info(`port: ${config.port}`);
  app.listen(config.port);
}
