RedisNG
===========

[![Greenkeeper badge](https://badges.greenkeeper.io/steelbrain/RedisNG-Node.svg)](https://greenkeeper.io/)
RedisNG is an extremely lightweight yet full featured Redis client for Node.js

#### Installation
```bash
npm install --save redisng
```

#### Usage
```js

import Redis from 'redisng'

const redis = new Redis()
redis.connect().then(function() {
  return redis.set('KEY', 'VALUE').then(function() {
    return redis.get('KEY')
  }).then(function(result) {
    console.log(result)
    redis.close()
  })
}, function(e) {
  console.log(e.message, e.stack)
})
```

#### API

```js
class Redis extends EventEmitter{
  connect(host, port): Promise
  ref(): void
  unref(): void
  close(): void

  get(key): Promise<string>
  set(key, value): Promise<string>
  ... other redis commands ...
}
```

#### License
This project is licensed under the terms of MIT license. See the License file for more info.
