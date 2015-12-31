'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RedisNG = undefined;

var _net = require('net');

var _events = require('events');

var _redisProto = require('redis-proto');

const Commands = require('../vendor/commands');

class RedisNG extends _events.EventEmitter {
  constructor() {
    super();

    this.queue = [];
    this.socket = new _net.Socket();
    this.socket.on('data', buffer => {
      let queueLength = this.queue.length;
      for (let message of (0, _redisProto.decodeGen)(buffer)) {
        if (queueLength) {
          const queueItem = this.queue.shift();
          queueItem(message);
          queueLength--;
        } else if (message.length === 3 && message[0] === 'message') {
          // Channel broadcast
          this.emit('message', message[1], message[2]);
          this.emit(`message:${ message[1] }`, message[2]);
        }
      }
    });
  }
  connect() {
    let host = arguments.length <= 0 || arguments[0] === undefined ? '127.0.0.1' : arguments[0];
    let port = arguments.length <= 1 || arguments[1] === undefined ? 6379 : arguments[1];

    return new Promise((resolve, reject) => {
      this.socket.connect(port, host, resolve).on('error', reject);
    });
  }
  ref() {
    this.socket.ref();
  }
  unref() {
    this.socket.unref();
  }
  close() {
    // Terminate
    this.socket.close();
  }
}

exports.RedisNG = RedisNG;
const commandsLength = Commands.length;
for (let i = 0; i < commandsLength; ++i) {
  const command = Commands[i];
  const callback = function () {
    const parameters = Array.prototype.slice.call(arguments);
    parameters.unshift(command);
    const request = (0, _redisProto.encode)(parameters);
    return new Promise(resolve => {
      this.queue.push(resolve);
      this.socket.write(request);
    });
  };
  RedisNG.prototype[command] = callback;
  RedisNG.prototype[command.toLowerCase()] = callback;
}