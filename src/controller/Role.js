/**
 * File: Role.js
 * Project: app
 * FilePath: /src/controller/Role.js
 * Created Date: 2020-01-01 23:18:13
 * Author: Zz
 * -----
 * Last Modified: 2020-01-01 23:19:11
 * Modified By: Zz
 * -----
 * Description:
 */
import { RoleController } from '../lib';

class Role extends RoleController {
  constructor() {
    super('console', 'console.role', 'roles');
  }
}

module.exports = Role;
