/**
 * File: util.js
 * Project: app
 * FilePath: /src/lib/util.js
 * Created Date: 2019-10-21 15:06:58
 * Author: Zz
 * -----
 * Last Modified: 2020-01-04 15:39:14
 * Modified By: Zz
 * -----
 * Description:
 */

import crypto from 'crypto';

export default {
  md5Encode(text) {
    const md5 = crypto.createHash('md5');
    return md5.update(text).digest('hex');
  },

  randomStr(places = 6) {
    return Math.random().toString().slice(parseInt(places, 10) * -1);
  },

  aesEncode(text, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },

  aesDecode(text, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  },
  packageRet200(ctx, retData, convertDataFunc) {
    ctx.status = 200;
    ctx.body = convertDataFunc ? convertDataFunc(retData) : retData;
  },

  packageRet201(ctx, retData, convertDataFunc) {
    ctx.status = 201;
    ctx.body = convertDataFunc ? convertDataFunc(retData.data) : retData.data;
  },

  returnPage(page, defaultPage = 1) {
    return page ? Number(page) : defaultPage;
  },
  returnPageSize(pageSize, defaultPageSize = 10) {
    return pageSize ? Number(pageSize) : defaultPageSize;
  },

  async exportExcelFile(ctx, exportFun, step) {
    const query = {
      ...ctx.request.query,
    };
    delete query.fileName;
    const { limit } = query;
    delete query.limit;
    const unit = step || 100;
    let rows = [];
    if (!limit || limit <= unit) {
      let pageSize;
      if (limit) {
        pageSize = Number(limit);
      } else if (query.pageSize) {
        pageSize = Number(query.pageSize);
      } else {
        pageSize = 10;
      }
      const params = {
        ...query,
        offset: query.offset ? Number(query.offset) : 0,
        pageSize,
      };
      const data = await exportFun(ctx, params);
      rows = data.rows;
    } else {
      const offset = query.offset ? Number(query.offset) : 0;
      let count = 0;
      for (let i = offset; ; i += unit) {
        const params = {
          ...query,
          offset: offset + (count * unit),
          pageSize: unit,
        };
        let data = await exportFun(ctx, params);
        rows = rows.concat(data.rows);
        count += 1;

        if (params.offset + unit > data.total) {
          break;
        }
        if (params.offset + unit > limit + offset) {
          if (limit - params.offset <= 0) {
            break;
          }
          data = await exportFun(ctx, {
            ...query,
            offset: params.offset + 1 + unit,
            pageSize: limit - params.offset < 0 ? 0 : limit - params.offset,
          });
          rows = rows.concat(data.rows);
          break;
        }
      }
    }
    return Promise.resolve(rows);
  },

  async writeLog(ctx, err) {
    if (ctx.method === 'GET') return;
    // 日志中不记录密码，token
    const params = ctx.request.body;
    if (params && params.password) delete params.password;
    if (params && params.newPwd) delete params.newPwd;
    if (params && params.userPwd) delete params.userPwd;

    const body = {
      ...ctx.body,
    };
    if (body && body.password) delete body.password;
    if (body && body.newPwd) delete body.newPwd;
    if (body && body.userPwd) delete body.userPwd;
    if (body && body.token) delete body.token;

    if (ctx.type !== 'application/json') {
      return;
    }

    if (ctx.session.account) {
      if (err) {
        ctx.logger.error({
          url: ctx.request.url,
          body: ctx.request.body,
          err,
          status: err.status || 500,
        });
      }
      // TODO: 扔到队列里面执行写入日志数据库
    }
  },

  async apiAuth(ctx, next) {
    const authAccount = ctx.session.account;
    if (!authAccount) {
      ctx.throw({ message: '您当前的会话已超时，请重新登录' }, 401);
    }
    try {
      let authority = false;
      for (const item of authAccount.customData.authoritys) {
        // (1) 验证路由是否匹配
        let tmpPath = item.value;
        // 666最高权限
        if (parseInt(tmpPath, 10) === 666) {
          authority = true;
          break;
        }
        if (tmpPath) {
          tmpPath = tmpPath.replace(/(:.*)/g, '.*');
          const reg = new RegExp(tmpPath);
          if (reg.test(ctx.path)) {
            authority = true;
          }

          // (2) 验证方法是否匹配
          if (authority) {
            authority = false;
            if ((ctx.method === 'POST' && item.action === 'c')
              || (ctx.method === 'POST' && item.action === 'u')
              || (ctx.method === 'PUT' && item.action === 'u')
              || (ctx.method === 'GET' && item.action === 'r')
              || (ctx.method === 'DELETE' && item.action === 'd')
            ) {
              authority = true;
              break;
            }
          }
        }
      }
      if (!authority) {
        ctx.throw({ code: 403, message: '无权限访问' }, 403);
      }
    } catch (err) {
      ctx.throw(err, 403);
    }
    await next();
  },
};
