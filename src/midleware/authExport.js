/**
 * Project: app
 * File: authExport.js
 * Created Date: 2019-10-26 21:42:54
 * Author: Zz
 * Last Modified: 2019-11-29 10:28:36
 * Modified By: Zz
 * Description:
 */
import jwt from 'jsonwebtoken';
import config from '../config';

module.exports = async (ctx, next) => {
  const bo = config.authExportIncludePath.some((item) => item.test(ctx.path));
  if (!bo) {
    await next();
    return;
  }
  const authAccount = ctx.session.account;
  if (!authAccount) {
    ctx.throw({ message: '您还未登入' }, 401);
  }
  const { token } = ctx.query;
  try {
    const tmp = await ctx.cache.get(`${config.prefix}:${ctx.session.hotelID}:login:${ctx.session.accountID}`);
    if (tmp !== token) {
      ctx.throw({ message: '您当前的会话已超时，请重新登录' }, 401);
      return;
    }
    const tokenData = jwt.verify(token, config.jwtKey);
    ctx.request.token = tokenData;
  } catch (err) {
    ctx.throw({ message: '您当前的会话已超时，请重新登录' }, 401);
  }
  await next();
};
