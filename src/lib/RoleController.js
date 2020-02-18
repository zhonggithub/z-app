/**
 * File: RoleController.js
 * Project: app
 * FilePath: /src/lib/RoleController.js
 * Created Date: 2019-12-28 21:18:39
 * Author: Zz
 * -----
 * Last Modified: 2020-01-03 21:39:44
 * Modified By: Zz
 * -----
 * Description:
 */

import Controller from './Controller';

class RoleController extends Controller {
  constructor(service = '', role = '', resourceName = '', prefix = '') {
    super(resourceName, prefix);

    this.service = service;
    this.role = role;
  }

  actAsyncImp = async (ctx, cmd, params) => ctx.service[this.service].actAsync({
    role: this.role,
    cmd,
  }, {
    params,
  })

  actAsync = async (ctx, cmd, params, status = 200) => {
    if (!ctx.service[this.service] || !ctx.service[this.service].actAsync) {
      ctx.throw({
        code: 'ERR_SERVICE_CONFIG',
      }, 500);
    }
    if (!cmd) {
      ctx.throw({
        code: 'ERR_SERVICE_CMD',
      }, 500);
    }

    const response = await this.actAsyncImp(ctx, cmd, params);

    if (response.code !== 0) {
      ctx.throw(response, response.status || 500);
      return;
    }
    if (status !== 204) {
      ctx.body = response.data;
    }

    ctx.status = status;
  }

  create = async (ctx) => {
    const { body } = ctx.request;
    await this.actAsync(ctx, 'create', body, 201);
  }

  update = async (ctx) => {
    const { body } = ctx.request;
    body.id = ctx.params.id;
    await this.actAsync(ctx, 'update', body);
  }

  updateStatus = async (ctx) => {
    const { body } = ctx.request;
    body.id = ctx.params.id;
    await this.actAsync(ctx, 'updateStatus', body);
  }

  retrieve = async (ctx) => {
    await this.actAsync(ctx, 'retrieve', {
      id: ctx.params.id,
    });
  }

  list = async (ctx) => {
    const { query } = ctx;
    await this.actAsync(ctx, 'list', query);
  }

  treeList = async (ctx) => {
    const { query } = ctx;
    await this.actAsync(ctx, 'treeList', query);
  }

  listAll = async (ctx) => {
    const { query } = ctx;
    await this.actAsync(ctx, 'listAll', query);
  }

  logicDel = async (ctx) => {
    await this.actAsync(ctx, 'logicDel', {
      id: ctx.params.id,
    }, 204);
  }
}

module.exports = RoleController;
