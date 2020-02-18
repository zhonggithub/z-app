/*
 * Project: app
 * File: err
 * Created Date: 2019-10-26 21:28:31
 * Author: Zz
 * Last Modified: 2019-10-26 21:28:31
 * Modified By: Zz (quitjie@gmail.com)
 * Description:
 */
import { util } from '../lib';

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    await util.writeLog(ctx, err);
    ctx.logger.error({
      data: ctx.request.body,
      params: ctx.params,
      query: ctx.request.query,
      url: ctx.path,
      method: ctx.method,
    });
    ctx.status = err.status || 500;
    ctx.body = { message: err.message, code: err.code || ctx.status };
  }
};
