/**
 * File: Accounts1.js
 * Project: app
 * FilePath: /src/controller/Accounts1.js
 * Created Date: 2019-12-09 18:55:23
 * Author: Zz
 * -----
 * Last Modified: 2020-01-10 23:09:50
 * Modified By: Zz
 * -----
 * Description:
 */
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import md5File from 'md5-file/promise';
import asyncBusboy from 'async-busboy';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import svgCaptcha from 'svg-captcha';
import qr from 'qr-image';
import { RoleController, util } from '../lib';
import config from '../config';

class App extends RoleController {
  constructor() {
    super('console', 'console.account', 'accounts');
  }

  didResource = () => {
    // 创建超级管理员
    this.router.get('/admin', this.addAdmin);
    // 数据库初始化 TODO: 数据初始化完成后请注释该行
    this.router.get('/initDB', this.initDB);
    // 验证码
    this.router.get('/captcha', this.loginCaptcha);
    // 登入
    this.router.post('/login', this.login);
    // 登出
    this.router.post('/logout', this.logout);

    this.router.get('/afterLogin', this.afterLogin);
    this.router.get('/qrLoginCode', this.getQrLoginCode);
    this.router.get('/qrimage', this.getQRImage);
    this.router.post('/upload', this.upload);
  }

  addAdmin = async (ctx) => {
    const tel = '17379379675';
    const existRes = await this.actAsyncImp(ctx, 'findOne', { tel });
    if (existRes.code === 'ERR_ACCOUNT_NOT_EXIST') {
      // 创建超级管理员角色
      const roleRes = await ctx.service.console.actAsync({
        role: 'console.role',
        cmd: 'create',
      }, {
        params: {
          name: '超级管理员',
          value: 666,
        },
      });
      if (roleRes.code !== 0) {
        ctx.throw(roleRes, roleRes.status || 500);
      }
      const roleID = roleRes.data.id;
      // 增加超级管理员
      const params = {
        name: 'Zz',
        tel,
        email: '1006817093@qq.com',
        password: 'zz123456',
        roleID,
      };
      const response = await this.actAsyncImp(ctx, 'create', params);
      if (response.code !== 0) {
        ctx.throw(response, response.status || 500);
      }
      ctx.body = response.data;
      return;
    }
    if (existRes.code === 0) {
      ctx.body = existRes.data;
      return;
    }
    ctx.throw(existRes, existRes.status || 500);
  }

  initDB = async (ctx) => {
    // 先添加运营管理大模块
    const moduleCategoryRes = await ctx.service.console.actAsync({
      role: 'console.systemModuleCategory',
      cmd: 'create',
    }, {
      params: {
        name: '运营管理',
        index: 0,
      },
    });
    if (moduleCategoryRes.code !== 0) {
      ctx.throw(moduleCategoryRes, moduleCategoryRes.status || 500);
      return;
    }
    const categoryID = moduleCategoryRes.data.id;
    // 左侧一级菜单栏, 系统管理模块
    const systemModuleRes = await ctx.service.console.actAsync({
      role: 'console.systemModule',
      cmd: 'create',
    }, {
      params: {
        categoryID,
        parentID: '',
        name: '系统管理',
        key: `${config.pagePrefix}/system`,
        icon: 'setting',
        index: 999, // 运营管理大模块里面排序最后一个一级菜单
        status: 1,
      },
    });
    if (systemModuleRes.code !== 0) {
      ctx.throw(systemModuleRes, systemModuleRes.status || 500);
      return;
    }
    const parentID = systemModuleRes.data.id;
    // 左侧二级菜单 账号管理
    const teamRes = await ctx.service.console.actAsync({
      role: 'console.systemModule',
      cmd: 'create',
    }, {
      params: {
        categoryID,
        parentID,
        name: '账号管理',
        key: `${config.pagePrefix}/system/accounts`,
        icon: 'team',
        index: 0,
        status: 1,
      },
    });
    if (teamRes.code !== 0) {
      ctx.throw(teamRes, teamRes.status || 500);
      return;
    }
    // 左侧二级菜单 角色管理
    const roleRes = await ctx.service.console.actAsync({
      role: 'console.systemModule',
      cmd: 'create',
    }, {
      params: {
        categoryID,
        parentID,
        name: '角色管理',
        key: `${config.pagePrefix}/system/roles`,
        icon: 'key',
        index: 0,
        status: 1,
      },
    });
    if (roleRes.code !== 0) {
      ctx.throw(roleRes, roleRes.status || 500);
      return;
    }
    // 左侧二级菜单 日志管理
    const logRes = await ctx.service.console.actAsync({
      role: 'console.systemModule',
      cmd: 'create',
    }, {
      params: {
        categoryID,
        parentID,
        name: '日志管理',
        key: `${config.pagePrefix}/system/logs`,
        icon: 'unordered-list',
        index: 0,
        status: 1,
      },
    });
    if (logRes.code !== 0) {
      ctx.throw(logRes, logRes.status || 500);
      return;
    }
    // 左侧二级菜单 模块管理
    const moduleRes = await ctx.service.console.actAsync({
      role: 'console.systemModule',
      cmd: 'create',
    }, {
      params: {
        categoryID,
        parentID,
        name: '模块管理',
        key: `${config.pagePrefix}/system/modules`,
        icon: 'setting',
        index: 0,
        status: 1,
      },
    });
    if (moduleRes.code !== 0) {
      ctx.throw(moduleRes, moduleRes.status || 500);
    }
    ctx.body = {
      code: 0,
      message: 'success',
    };
  }

  loginCaptcha = async (ctx) => {
    const cap = svgCaptcha.create({
      ignoreChars: '0o1i',
      size: 4,
      noise: 1,
      background: '#cc9966',
    });
    ctx.session.verificationCode = cap.text;
    ctx.type = 'image/svg+xml';
    ctx.formatBody = false;
    ctx.body = cap.data;
  }

  login = async (ctx) => {
    const { body } = ctx.request;
    const {
      verificationCode, account, password, remember,
      kind,
    } = body;

    let accountRes = {};
    switch (kind) {
      case 'AT': { // 记住密码方式登录: token = password
        const tmp = await ctx.cache.get(`${config.prefix}:console:login:${account}`);
        if (tmp.token !== password) {
          ctx.throw({
            message: '身份验证失败，请重新输入账号和密码登录',
          }, 401);
          return;
        }

        accountRes = await this.actAsyncImp(ctx, 'retrieve', {
          id: tmp.accountID,
        });
        break;
      }
      case 'AP': { // 账号加密码方式登录
        if (ctx.session.verificationCode === undefined) {
          ctx.throw({ code: 'ERR_VERIFICATION_CODE_EXPIRED' });
          return;
        }
        if (ctx.session.verificationCode.toLowerCase() !== verificationCode.toLowerCase()) {
          ctx.throw({ code: 'INVALID_VERIFICATION_CODE' });
          return;
        }
        accountRes = await this.actAsyncImp(ctx, 'login', {
          tel: account,
          password,
        });
        break;
      }
      case 'TV': { // 手机+验证码方式
        break;
      }
      default:
    }

    if (accountRes.code !== 0) {
      ctx.throw(accountRes, accountRes.status || 500);
    }

    // 判断角色状态是否可以登录
    if (accountRes.data.role && accountRes.data.role.status !== 1) {
      ctx.throw({
        code: 'ERR_ROLE_BANNED_LOGIN',
      }, 401);
      return;
    }

    // 判断账号状态是否可以登录
    if (accountRes.data.status !== 1) {
      ctx.throw({
        code: 'ERR_ACCOUNT_BANNED_LOGIN',
      }, 401);
      return;
    }

    // 获取手机号对应的员工信息
    let employee = { id: '', name: '' };
    const employeeRes = await ctx.service.console.actAsync({
      role: 'console.employee',
      cmd: 'findOne',
    }, {
      params: {
        tel: account,
        status: 1,
      },
    });
    if (employeeRes.code !== 0 && employeeRes.code !== 'ERR_EMPLOYEE_NOT_EXISTED') {
      ctx.throw(employeeRes, employeeRes.status || 500);
      return;
    }
    if (employeeRes.code === 0) {
      if (employeeRes.data.status !== 1) {
        ctx.throw({
          code: 'ERR_EMPLOYEE_BANNED_LOGIN',
        }, 401);
        return;
      }
      employee = employeeRes.data;
    }

    ctx.session.account = accountRes.data;
    ctx.session.accountID = accountRes.data.id;
    ctx.session.employee = employee;
    ctx.session.apiIDs = accountRes.data.role.apiIDs;

    const user = accountRes.data;
    user.employee = employee;

    // 生成token
    const exp = moment().add(12, 'h').unix();
    const payload = {
      iat: moment().unix(),
      exp,
      accountID: accountRes.data.accountID,
      employeeID: employee.id,
    };
    const token = jwt.sign(payload, config.jwtKey);

    const data = {
      user,
      token,
    };

    await ctx.cache.set(`${config.prefix}:console:login:${ctx.session.accountID}`, token, 12 * 3600);
    if (remember) {
      const maxAge = 7 * 24 * 3600 * 1000;
      ctx.cookies.set('account', account, {
        maxAge, // cookie有效时长
        expires: moment().add(7, 'days').toDate(),
        httpOnly: false,
        overwrite: false,
      });
      const tmpData = util.md5Encode(token);
      ctx.cookies.set('password', tmpData, {
        maxAge, // cookie有效时长
        expires: moment().add(7, 'days').toDate(),
        httpOnly: false,
        overwrite: false,
      });
      await ctx.cache.set(`${config.prefix}:console:login:${account}`, {
        token: tmpData,
        accountID: ctx.session.accountID,
      }, maxAge);
    }

    ctx.body = data;
  }

  /**
   * @apiDescription 登录后操作
   * 比如获取模块访问权限信息
   */
  afterLogin = async (ctx) => {
    // 获取角色信息
    const roleRes = await ctx.service.console.actAsync({
      role: 'console.role',
      cmd: 'retrieve',
    }, {
      params: {
        id: ctx.session.account.roleID,
        module: true,
      },
    });
    if (roleRes.code !== 0) {
      ctx.throw(roleRes, roleRes.status || 500);
    }

    const data = {
      role: roleRes.data,
    };

    ctx.body = data;
  }

  logout = async (ctx) => {
    await ctx.cache.del(`${config.prefix}:console:login:${ctx.session.accountID}`);
    delete ctx.session.account;
    delete ctx.session.accountID;
    delete ctx.session.hotelID;

    ctx.request.token = null;
    ctx.body = {};
  }

  /**
   * 扫二维码登录相关函数
   */
  getQrLoginCode = async (ctx) => {
    const code = util.randomStr();
    await ctx.cache.set(`${config.appName}:cache:${code}`, { time: moment().unix() }, 60 * 3);
    ctx.body = {
      code,
    };
  }

  getQRImage = async (ctx) => {
    try {
      const code = ctx.query.q;
      const tmpCode = await ctx.cache.get(`${config.appName}:cache:${code}`);
      if (!code || !tmpCode) {
        ctx.throw({ message: '无效的登入码', code: 'ERR_CODE_EXPIRED' }, 401);
      }

      if (moment().subtract(3, 'minutes').unix() > tmpCode.time) {
        ctx.throw({ code: 'ERR_TIME_OUT' }, 400);
      }
      const img = qr.image(`${config.loginQRText}?q=${code}`, { size: 10 });
      ctx.body = img;
    } catch (e) {
      ctx.status = 414;
      ctx.body = e;
    }
  }

  upload = async (ctx) => {
    const {
      files,
    } = await asyncBusboy(ctx.req);

    if (files.length !== 1) {
      ctx.throw({ code: 403, message: 'ERR_UPLOAD_FILE_NOT_EXIST', files }, 403);
      return;
    }
    const file = files[0];

    const allowExt = [
      '.pdf', '.xlsx', '.doc',
      '.docx', '.docs', '.wps', '.ppt',
      '.png', '.jpg', '.jpeg', '.webp',
    ];
    const ext = path.extname(file.path);
    if (allowExt.indexOf(ext) === -1) {
      ctx.throw({ code: 403, message: 'ERR_FILE_EXT_NOT_ALLOW' }, 403);
    }
    const fileHash = await md5File(file.path);

    const imgRes = await ctx.service.console.actAsync({
      role: 'console.imgResources',
      cmd: 'findOne',
    }, {
      params: {
        fileHash,
      },
    });
    if (imgRes.data && imgRes.data.url) {
      ctx.body = {
        fileHash,
        url: imgRes.data.url,
      };
      return;
    }

    const fileName = path.basename(file.filename, ext) + fileHash + ext;
    const savePath = path.join(config.uploadDir);
    // 判断路径是否存在,如果不存在创建
    if (!fs.existsSync(savePath)) {
      mkdirp.sync(savePath);
    }
    const targetFilePath = path.join(savePath, fileName);
    const stream = fs.createWriteStream(targetFilePath);
    file.pipe(stream);

    // 记录资源hash
    const response = await ctx.service.console.actAsync({
      role: 'console.imgResources',
      cmd: 'create',
    }, {
      params: {
        fileHash,
        url: `https://${config.cdnHost}${config.uploadRoot}/${fileName}`,
      },
    });
    if (response.code !== 0) {
      ctx.throw(response, response.status || 500);
      return;
    }

    ctx.body = {
      fileHash,
      url: `https://${config.cdnHost}${config.uploadDir}/${fileName}`,
    };
  }
}

module.exports = App;
