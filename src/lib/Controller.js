/**
 * File: Controller.js
 * Project: app
 * FilePath: /src/controller/Controller.js
 * Created Date: 2019-10-26 23:45:44
 * Author: Zz
 * -----
 * Last Modified: 2019-12-09 19:11:40
 * Modified By: Zz
 * -----
 * Description: 提供基础的resultful api。
 * api包括create, update, updateStatus, retrieve
 * list, treeList, exportExcel, logicDel, count
 * 使用的时候只要继承该类并实现对应的方法即可.
 * 如果需要自定义路由，请在子类实现didResource 方法.
 */

import Router from 'koa-router';

function isFunction(functionName) {
  return functionName && typeof functionName === 'function';
}

export default class Controller {
  constructor(resourceName = '', prefix = '') {
    this.resourceName = resourceName;
    this.prefix = prefix;

    if (prefix) {
      this.apiPrefix = `/${prefix}/${this.resourceName}`;
    } else {
      this.apiPrefix = `/${this.resourceName}`;
    }

    this.router = new Router();
  }

  resource() {
    const {
      create, update, updateStatus, retrieve, list, treeList,
      listAll, exportExcel, logicDel, count, didResource,
    } = this;

    // 创建
    if (isFunction(create)) {
      this.router.post(this.apiPrefix, create);
    }

    const idUrl = `${this.apiPrefix}/:id`;
    // 更新
    if (isFunction(update)) {
      this.router.post(idUrl, update);
    }

    // 更新状态
    if (isFunction(updateStatus)) {
      this.router.post(`${idUrl}/status`, updateStatus);
    }

    // 获取信息
    if (isFunction(retrieve)) {
      this.router.get(idUrl, retrieve);
    }

    // 列表
    if (isFunction(list)) {
      this.router.get(this.apiPrefix, list);
    }

    // 树形列表
    if (isFunction(treeList)) {
      this.router.get(`/treeList${this.apiPrefix}`, treeList);
    }

    // listAll
    if (isFunction(listAll)) {
      this.router.get(`/listAll${this.apiPrefix}`, listAll);
    }

    // 导出到excel
    if (isFunction(exportExcel)) {
      this.router.get(`/exportExcel${this.apiPrefix}`, exportExcel);
    }

    // 删除
    if (isFunction(logicDel)) {
      this.router.del(idUrl, logicDel);
    }

    // 计算
    if (isFunction(count)) {
      this.router.get(`/count${this.apiPrefix}`, count);
    }

    if (isFunction(didResource)) {
      didResource();
    }
    return this.router;
  }
}
