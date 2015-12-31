'use babel'

import {Socket} from 'net'
import {EventEmitter} from 'events'
import {encode, decodeGen} from 'redis-proto'

const Commands = require('../vendor/commands')

export class RedisNG extends EventEmitter {
  constructor() {
    super()

    this.queue = []
    this.socket = new Socket()
    this.socket.on('data', buffer => {
      let queueLength = this.queue.length
      for (let message of decodeGen(buffer)) {
        if (queueLength) {
          const queueItem = this.queue.shift()
          queueItem(message)
          queueLength--
        } else if (message.length === 3 && message[0] === 'message') {
          // Channel broadcast
          this.emit('message', message[1], message[2])
          this.emit(`message:${message[1]}`, message[2])
        }
      }
    })
  }
  connect(host = '127.0.0.1', port = 6379) {
    return new Promise((resolve, reject) => {
      this.socket.connect(port, host, resolve).on('error', reject)
    })
  }
  ref() {
    this.socket.ref()
  }
  unref() {
    this.socket.unref()
  }
  close() {
    // Terminate
    this.socket.close()
  }
}

const commandsLength = Commands.length
for (let i = 0; i < commandsLength; ++i) {
  const command = Commands[i]
  const callback = function() {
    const request = encode(Array.prototype.slice.call(arguments).unshift(command))
    return new Promise(resolve => {
      this.queue.push(resolve)
      this.socket.write(request)
    })
  }
  RedisNG.prototype[command] = callback
  RedisNG.prototype[command.toLowerCase()] = callback
}
