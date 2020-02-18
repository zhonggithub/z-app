/**
 * Project: app
 * File: getBody.js
 * Created Date: 2019-10-26 21:40:19
 * Author: Zz
 * Last Modified: 2020-01-10 22:42:21
 * Modified By: Zz
 * Description:
 */
import contentType from 'content-type';
import rawBody from 'raw-body';

module.exports = async (ctx, next) => {
  if (
    ctx.method !== 'POST'
    && ctx.method !== 'post'
    && ctx.method !== 'PUT'
    && ctx.method !== 'put'
  ) {
    await next();
    return;
  }
  if (ctx.req.headers['content-type'] !== 'application/json') {
    await next();
    return;
  }
  try {
    const body = await rawBody(ctx.req, {
      length: ctx.req.headers['content-length'],
      encoding: contentType.parse(ctx.req).parameters.charset,
    });
    ctx.request.body = JSON.parse(body);
  } catch (err) {
    ctx.throw(err, 400);
  }
  await next();
};
