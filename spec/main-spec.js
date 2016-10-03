/* @flow */

import RedisNG from '../src'

const redis = new RedisNG()
redis.connect().then(function() {
  console.log('connected')
  return redis.set('KEY', 'VALUE').then(function() {
    console.log('value set')
    return redis.get('KEY')
  }).then(function(result) {
    console.log(result === 'VALUE' ? 'result matches' : 'result mismatches')
    redis.unref()
  })
}, function(e) {
  console.log(e.message, e.stack)
})
