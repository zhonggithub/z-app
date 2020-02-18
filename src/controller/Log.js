/**
 * File: Log.js
 * Project: app
 * FilePath: /src/controller/Log.js
 * Created Date: 2020-01-01 23:18:37
 * Author: Zz
 * -----
 * Last Modified: 2020-01-01 23:18:58
 * Modified By: Zz
 * -----
 * Description:
 */
import { RoleController } from '../lib';

class Log extends RoleController {
  constructor() {
    super('console', 'console.log', 'logs');
  }
}

module.exports = Log;
