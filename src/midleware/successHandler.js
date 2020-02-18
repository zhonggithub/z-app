/**
 * Project: app
 * File: successHandler.js
 * Created Date: 2019-10-26 21:32:29
 * Author: Zz
 * Last Modified: 2020-01-04 10:00:54
 * Modified By: Zz
 * Description:
 */

import { util } from '../lib';

module.exports = async (ctx, next) => {
  await next();
  if (ctx.type === 'application/json' || ctx.method === 'DELETE') {
    ctx.response.set('X-Server-Request-Id', ctx.reqId);
    if (!ctx.status || (ctx.status >= 200 && ctx.status < 400)) {
      await util.writeLog(ctx, null);
      if (ctx.formatBody !== false) {
        ctx.body = {
          code: 0,
          message: 'success',
          data: ctx.body,
        };
      }
    }
  }
};
