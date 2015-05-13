"use strict";

var
  Socket = require('net').Socket,
  EventEmitter = require('events').EventEmitter,
  Promise = require('a-promise'),
  RedisProto = require('redis-proto'),
  Commands = require('../Dist/Commands.js');
class Redis extends EventEmitter{
  constructor(){
    super();

    let Me = this;
    this.Socket = new Socket();
    this.Socket.on('data', function(Buffer){
      try {
        Buffer = RedisProto.Decode(Buffer.toString());
        if(Me.Expecting) Me.Expecting[0](Buffer);
        else if(Buffer.length === 3 && Buffer[0] === 'message'){
          Me.emit('message', Buffer[1], Buffer[2]);
          Me.emit('message:' + Buffer[1], Buffer[2]);
        }
      } catch (err){
        // Assign new Trace
        err = new Error(err.message);
        if(Me.Expecting) Me.Expecting[1](err);
        else Me.emit('error', err);
      }
      Me.Expecting = null;
    });
    this.Expecting = null;
  }
  connect(Host, Port){
    Host = Host || '127.0.0.1';
    Port = Port || 6379;
    let Me = this;
    return new Promise(function(Resolve){
      Me.Socket.connect(Port, Host, Resolve);
    });
  }
  ref(){
    this.Socket.ref();
  }
  unref(){
    this.Socket.unref();
  }
  close(){
    this.Socket.close();
  }
}
Commands.forEach(function(Entry){
  let Execute = function(){
    Array.prototype.unshift.call(arguments, Entry);
    let Encoded = RedisProto.Encode(arguments);
    let Me = this;
    return new Promise(function(Resolve, Reject){
      Me.Socket.write(Encoded + "\r\n", 'utf8', function(){
        Me.Expecting = [Resolve, Reject];
      });
    });
  };
  Redis.prototype[Entry] = Execute;
  Redis.prototype[Entry.toLowerCase()] = Execute;
});
module.exports = Redis;