/*
 * @Author: Zz
 * @Date: 2017-05-14 22:37:10
 * @Last Modified by: Zz
 * @Last Modified time: 2018-09-05 16:14:08
 */
import Redis from 'ioredis';
import config from '../config';

export default class Cache {
  constructor() {
    this.redis = new Redis(config.cache);
  }

  async set(key, data, time = 60) {
    const dataStr = JSON.stringify(data);
    const multi = this.redis.multi();
    multi.set(key, dataStr);
    multi.expire(key, time);
    return multi.exec();
  }

  async get(key) {
    let result = await this.redis.get(key);
    if (result && result !== null && result !== '') {
      result = JSON.parse(result);
    } else {
      result = false;
    }
    return result;
  }

  async del(key) {
    return this.redis.del(key);
  }

  async keys(key = '') {
    return this.redis.keys(key);
  }
}
