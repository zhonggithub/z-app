/**
 * Project: app
 * File: accounts.js
 * Created Date: 2019-10-27 00:55:22
 * Author: Zz
 * Last Modified: 2020-01-01 22:40:56
 * Modified By: Zz
 * Description: 系统模块总分类
 */

import { Controller } from '../lib';

class SystemModuleCategory extends Controller {
  constructor() {
    super('moduleCategories');

    this.role = 'console.systemModuleCategory';
  }

  create = async (ctx) => {
    const { body } = ctx.request;
    const response = await ctx.service.console.actAsync({
      role: this.role,
      cmd: 'create',
    }, {
      params: body,
    });

    if (response.code !== 0) {
      ctx.throw(response, response.status || 500);
      return;
    }
    ctx.body = response.data;
    ctx.status = 201;
  }

  update = async (ctx) => {
    const { body } = ctx.request;
    body.id = ctx.params.id;
    const response = await ctx.service.console.actAsync({
      role: this.role,
      cmd: 'update',
    }, {
      params: body,
    });

    if (response.code !== 0) {
      ctx.throw(response, response.status || 500);
      return;
    }
    ctx.body = response.data;
  }

  updateStatus = async (ctx) => {
    const { body } = ctx.request;
    body.id = ctx.params.id;
    const response = await ctx.service.console.actAsync({
      role: this.role,
      cmd: 'updateStatus',
    }, {
      params: body,
    });

    if (response.code !== 0) {
      ctx.throw(response, response.status || 500);
      return;
    }
    ctx.body = response.data;
  }

  retrieve = async (ctx) => {
    const response = await ctx.service.console.actAsync({
      role: this.role,
      cmd: 'retrieve',
    }, {
      params: {
        id: ctx.params.id,
      },
    });

    if (response.code !== 0) {
      ctx.throw(response, response.status || 500);
      return;
    }
    ctx.body = response.data;
  }

  list = async (ctx) => {
    const { query } = ctx;
    const response = await ctx.service.console.actAsync({
      role: this.role,
      cmd: 'retrieve',
    }, {
      params: query,
    });

    if (response.code !== 0) {
      ctx.throw(response, response.status || 500);
      return;
    }
    ctx.body = response.data;
  }

  listAll = async (ctx) => {
    const { query } = ctx;
    const response = await ctx.service.console.actAsync({
      role: this.role,
      cmd: 'listAll',
    }, {
      params: query,
    });

    if (response.code !== 0) {
      ctx.throw(response, response.status || 500);
      return;
    }
    ctx.body = response.data;
  }
}

module.exports = SystemModuleCategory;
