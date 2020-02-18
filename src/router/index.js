/**
 * Project: app
 * File: router.js
 * Created Date: 2019-10-21 16:04:28
 * Author: Zz
 * Last Modified: 2019-12-28 11:38:11
 * Modified By: Zz
 * Description:
 */

import Router from 'koa-router';
import fs from 'fs';
import path from 'path';
import config from '../config';

const { apiPrefix } = config;

const router = new Router();

function fileDisplay() {
  // 根据文件路径读取文件，返回文件列表
  const dirPath = `${__dirname}/../controller`;
  const files = fs.readdirSync(dirPath);
  files.forEach((filename) => {
    // 获取当前文件的绝对路径
    const filedir = path.join(dirPath, filename);
    if (filename.endsWith('.js') && filename !== 'index.js') {
      const Controller = require(filedir);
      const controller = new Controller();
      const tmpRouter = controller.resource();
      router.use(apiPrefix, tmpRouter.routes(), tmpRouter.allowedMethods());
    }
  });
}

fileDisplay();

router.get('*', async (ctx) => {
  ctx.type = 'html';
  ctx.body = fs.createReadStream(`${__dirname}/../public/index.html`);
});

export default (app) => {
  app
    .use(router.routes())
    .use(router.allowedMethods());
};
