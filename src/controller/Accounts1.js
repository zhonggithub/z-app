/**
 * File: Accounts1.js
 * Project: app
 * FilePath: /src/controller/Accounts1.js
 * Created Date: 2019-12-09 18:55:23
 * Author: Zz
 * -----
 * Last Modified: 2019-12-28 11:29:14
 * Modified By: Zz
 * -----
 * Description:
 */

import { Controller } from '../lib';

class Accounts extends Controller {
  constructor() {
    super('accounts1');
  }

  create = async (ctx) => {
    ctx.body = {
      id: 'zz1',
      name: 'zz1',
      status: 0,
    };
  }

  update = async (ctx) => {
    ctx.body = {
      id: 'zz0',
      name: 'zz0',
      status: 0,
    };
  }

  updateStatus = async (ctx) => {
    ctx.body = {
      id: 'zz0',
      name: 'zz0',
      status: 1,
    };
  }

  retrieve = async (ctx) => {
    ctx.body = {
      id: 'zz0',
      name: 'zz0',
      status: 1,
    };
  }

  list = async (ctx) => {
    ctx.body = {
      items: [{
        id: 'zz0',
        name: 'zz0',
        status: 1,
      }],
      page: 1,
      pageSize: 15,
    };
  }

  treeList = async (ctx) => {
    ctx.body = [{
      id: 'zz0',
      name: 'zz0',
      status: 1,
      children: [],
    }];
  }

  listAll = async (ctx) => {
    ctx.body = [{
      id: 'zz0',
      name: 'zz0',
      status: 1,
    }];
  }

  exportExcel = async (ctx) => {
    ctx.body = {
      id: 'excel',
      name: 'excel',
    };
  }

  logicDel = async (ctx) => {
    ctx.body = null;
    ctx.status = 204;
  }

  didResource = () => {
    this.router.get(`/didResource${this.apiPrefix}`, this.testDidResource);
  }

  testDidResource = async (ctx) => {
    ctx.body = { methond: 'didResource' };
    ctx.status = 200;
  }
}

module.exports = Accounts;
