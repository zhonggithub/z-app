/**
 * Project: app
 * File: auth.js
 * Created Date: 2019-10-26 21:41:50
 * Author: Zz
 * Last Modified: 2019-12-30 20:16:46
 * Modified By: Zz
 * Description:
 */
import jwt from 'jsonwebtoken';
import config from '../config';

const tmpPath = config.apiPrefix.replace(/(:.*)/g, '.*');
const reg = new RegExp(tmpPath);

module.exports = async (ctx, next) => {
  const bo = config.authIgnorePath.some((item) => item.test(ctx.path));
  if (bo) {
    await next();
    return;
  }

  // 判断是否是api路由
  if (!reg.test(ctx.path)) {
    await next();
    return;
  }

  const authAccount = ctx.session.account;
  if (!authAccount) {
    ctx.throw({ message: '您还未登录，请前往登录' }, 401);
  }
  const { token } = ctx.header;
  try {
    const tmp = await ctx.cache.get(`${config.prefix}:console:login:${ctx.session.accountID}`);
    if (tmp !== token) {
      ctx.throw({ message: '您的账号在其他地方登入，如非本人操作请及时登入并更改密码' }, 401);
      return;
    }

    const tokenData = jwt.verify(token, config.jwtKey);
    ctx.request.token = tokenData;
    ctx.accountID = ctx.session.accountID;
  } catch (err) {
    ctx.throw({ message: '您当前的会话已超时，请重新登录', err }, 401);
  }
  await next();
};
