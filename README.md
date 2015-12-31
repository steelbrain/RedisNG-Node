RedisNG
===========
RedisNG is an extremely lightweight yet full feature Redis client for Node.js

#### Installation
```bash
npm install --save redisng
```

#### Usage
```js
'use babel'

import {RedisNG} from 'redisng'

const redis = new RedisNG()
redis.connect().then(function() {
  return redis.set('KEY', 'VALUE').then(function() {
    return redis.get('KEY')
  }).then(function(result) {
    console.log(result)
    redis.unref()
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
  unref(): void // graceful shutdown
  close(): void // terminate

  get(key): Promise<string>
  set(key, value): Promise<string>
  ... other redis commands ...
}
```

#### License
This project is licensed under the terms of MIT license. See the License file for more info.
