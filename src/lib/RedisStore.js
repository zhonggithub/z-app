/*
 * @Author: Zz
 * @Date: 2017-03-19 11:01:44
 * @Last Modified by: Zz
 * @Last Modified time: 2019-09-05 20:13:52
 */
import Redis from 'ioredis';
import config from '../config';

const ONE_DAY = 1000 * 60 * 60 * 24;

export default class RedisStore {
  constructor() {
    this.redis = new Redis(config.session.redis);
  }

  async get(key) {
    const data = await this.redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  }

  async set(key, value, maxAge) {
    const tmpMaxAge = typeof maxAge === 'number' ? maxAge : ONE_DAY;
    const tmpValue = JSON.stringify(value);
    await this.redis.set(key, tmpValue, 'PX', tmpMaxAge);
  }

  async destroy(key) {
    await this.redis.del(key);
  }
}
