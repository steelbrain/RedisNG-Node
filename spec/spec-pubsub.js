const RedisNG = require('../').RedisNG

const redis = new RedisNG()
const publisher = new RedisNG()
redis.on('message', function(channel, message) {
  console.log('global handler triggered', channel, message)
})
redis.on('message:CHAN', function(message) {
  console.log('channel handler triggered', message)
  publisher.unref()
  redis.unref()
})
redis.connect().then(function() {
  return redis.subscribe('CHAN').then(function() {
    return publisher.connect()
  }).then(function() {
    publisher.publish('CHAN', 'Message')
  })
}, function(e) {
  console.log(e.message, e.stack)
})
