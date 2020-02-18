/*
 * @Author: Zz
 * @Date: 2017-05-23 09:59:46
 * @Last Modified by: Zz
 * @Last Modified time: 2019-04-16 10:57:55
 */
if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || '6379';
const redisDB = process.env.REDIS_DB || '0';
const redisPassword = process.env.REDIS_PASSWORD || '';

const cdnHost = process.env.CDN_HOST || '';
if (!cdnHost) {
  throw new Error('缺少环境变量:CDN_HOST');
}

const uploadRoot = process.env.UPLOAD_ROOT || '';

const uploadDir = process.env.UPLOAD_DIR || '';
if (!uploadDir) {
  throw new Error('缺少环境变量:UPLOAD_DIR');
}

const prefix = 'z-app';
export default {
  prefix,
  apiPrefix: '/app/api',
  pagePrefix: '/console',
  appPrefix: process.env.APP_PREFIX,
  appName: process.env.APP_NAME || prefix,
  logLevel: process.env.LOG_LEVEL || 'info',
  session: {
    redis: {
      host: redisHost,
      port: redisPort,
      options: {
        dropBufferSupport: true,
      },
      db: redisDB,
      password: redisPassword,
      dropBufferSupport: true,
    },
    prefix: `${prefix}:session`,
  },
  cache: {
    ttl: 120,
    host: redisHost,
    port: redisPort,
    dropBufferSupport: true,
    db: redisDB,
    password: redisPassword,
  },
  jwtKey: process.env.JWT_KEY || 'v*&^tyt$%#is',
  port: process.env.PORT || 3000,
  websocket: {
    host: process.env.WEB_SOCKET_HOST || '0.0.0.0',
    port: process.env.WEB_SOCKET_PROT || 7007,
    type: process.env.WEB_SOCKET_TYPE || 'z-app',
  },

  cdnHost,
  uploadRoot,
  uploadDir,

  // 中间件配置
  middleware: [
    'getBody',
    'auth',
    'authExport',
    'errHandler',
    'successHandler',
  ],
  // auth 需要 '忽略' 的路由
  authIgnorePath: [
    /login$/,
    /admin$/,
    /initDB$/,
    /captcha$/,
    /qrLoginCode$/,
    /qrimage$/,
    /^\/exportExcel\/(.+)/,
    /accounts$/, // TODO:仅供测试，线上部署请移除此配置
    /accounts2$/, // TODO:仅供测试，线上部署请移除此配置
    /didResource/, // TODO:仅供测试，线上部署请移除此配置
  ],
  // authExport 需要 '匹配' 的路由
  authExportIncludePath: [/^\/exportExcel\/(.+)/],

  service: {},
};
