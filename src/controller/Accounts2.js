/**
 * File: Account2.js
 * Project: app
 * FilePath: /src/controller/Account2.js
 * Created Date: 2019-12-28 21:38:04
 * Author: Zz
 * -----
 * Last Modified: 2019-12-28 21:52:40
 * Modified By: Zz
 * -----
 * Description:
 */


import { RoleController } from '../lib';

class Accounts2 extends RoleController {
  constructor() {
    super('console', 'account', 'accounts2');
  }

  actAsync = async (ctx, cmd, params, status) => {
    ctx.body = {
      id: 'zz2',
      name: 'zz2',
      cmd,
      params,
      status,
    };
  }

  didResource = () => {
    this.router.get(`/didResource${this.apiPrefix}`, this.testDidResource);
  }

  testDidResource = async (ctx) => {
    ctx.body = { methond: 'didResource2' };
    ctx.status = 200;
  }
}

module.exports = Accounts2;
