/* @flow */

import { encode } from 'redis-proto'
import Commands from '../vendor/commands'

// eslint-disable-next-line import/prefer-default-export
export function injectInto(RedisNG: Object): void {
  const commandsLength = Commands.length
  for (let i = 0; i < commandsLength; ++i) {
    const command = Commands[i]
    const callback = function(...parameters) {
      parameters.unshift(command)
      const request = encode(parameters)
      return new Promise((resolve) => {
        this.queue.push(resolve)
        this.socket.write(request)
      })
    }
    RedisNG.prototype[command] = callback
    RedisNG.prototype[command.toLowerCase()] = callback
  }
}
