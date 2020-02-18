/**
 * File: Module.js
 * Project: app
 * FilePath: /src/controller/Module.js
 * Created Date: 2020-01-01 22:47:38
 * Author: Zz
 * -----
 * Last Modified: 2020-01-01 22:56:16
 * Modified By: Zz
 * -----
 * Description:
 */
import { RoleController } from '../lib';

class Module extends RoleController {
  constructor() {
    super('console', 'console.systemModule', 'modules');
  }
}

module.exports = Module;
