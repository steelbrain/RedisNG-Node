/* @flow */

import { Socket } from 'net'
import EventEmitter from 'events'
import { decodeGen } from 'redis-proto'
import { injectInto } from './helpers'

class RedisNG extends EventEmitter {
  queue: Array<Function>;
  socket: Socket;

  constructor() {
    super()

    this.queue = []
    this.socket = new Socket()
    this.socket.on('data', buffer => {
      let queueLength = this.queue.length
      for (const message of decodeGen(buffer)) {
        if (queueLength) {
          this.queue.shift()(message)
          queueLength--
        } else if (message.length === 3 && message[0] === 'message') {
          // Channel broadcast
          this.emit('message', message[1], message[2])
          this.emit(`message:${message[1]}`, message[2])
        }
      }
    })
  }
  connect(host: string = '127.0.0.1', port: number = 6379) {
    return new Promise((resolve, reject) => {
      this.socket.on('error', reject)
      this.socket.connect({ port, host }, () => {
        this.socket.removeListener('error', reject)
        resolve()
      })
    })
  }
  ref() {
    this.socket.ref()
  }
  unref() {
    this.socket.unref()
  }
  close() {
    this.socket.end()
  }
}

injectInto(RedisNG)

module.exports = RedisNG
