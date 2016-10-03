/* @flow */

import { it, wait } from 'jasmine-fix'
import Redis from '../'

describe('Redis', function() {
  it('works with commands', async function() {
    const redis = new Redis()
    await redis.connect()
    await redis.set('KEY', 'VALUE')
    expect(await redis.get('KEY')).toBe('VALUE')
  })
  it('has working pubsub support', async function() {
    let timesGlobal = 0
    let timesScoped = 0

    const redis = new Redis()
    const publisher = new Redis()
    redis.on('message', function(channel, message) {
      expect(channel).toBe('CHAN')
      expect(message).toBe('FOOOD')
      timesGlobal++
    })
    redis.on('message:CHAN', function(message) {
      expect(message).toBe('FOOOD')
      timesScoped++
    })

    await redis.connect()
    await publisher.connect()
    await redis.subscribe('CHAN')
    await publisher.publish('CHAN', 'FOOOD')
    await wait(50)

    expect(timesGlobal).toBe(1)
    expect(timesScoped).toBe(1)

    redis.close()
    publisher.close()
  })
})
