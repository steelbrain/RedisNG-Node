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
      Buffer = RedisProto.DecodeGen(Buffer.toString());
      let BufferValue = [];
      while(true){
        try {
          let Entry = Buffer.next();
          if(Entry.done) break;
          BufferValue = Entry.value;
        } catch (err){
          err = new Error(err.message);
          if(Me.Expecting.length) Me.Expecting.shift()[1](err);
          else Me.emit('error', err);
          continue ;
        }
        if(Me.Expecting.length) Me.Expecting.shift()[0](BufferValue);
        else if(BufferValue.length === 3 && BufferValue[0] === 'message'){
          Me.emit('message', BufferValue[1], BufferValue[2]);
          Me.emit('message:' + BufferValue[1], BufferValue[2]);
        }
      }
    });
    this.Expecting = [];
  }
  connect(Host, Port){
    Host = Host || '127.0.0.1';
    Port = Port || 6379;
    let Me = this;
    return new Promise(function(Resolve){
      Me.Socket.connect(Port, Host, Resolve);
    });
  }
  ref(){ this.Socket.ref() }
  unref(){ this.Socket.unref() }
  close(){ this.Socket.close() }
}
Commands.forEach(function(Entry){
  let Execute = function(){
    Array.prototype.unshift.call(arguments, Entry);
    let Callback = null;
    if(typeof arguments[arguments.length - 1] === 'function'){
      Callback = Array.prototype.pop.call(arguments);
    }
    let Encoded = RedisProto.Encode(arguments);
    let Me = this;
    if(Callback === null){
      return new Promise(function(Resolve, Reject){
        Me.Socket.write(Encoded + "\r\n", 'utf8', function(){
          Me.Expecting.push([Resolve, Reject]);
        });
      });
    } else {
      Me.Socket.write(Encoded + "\r\n", 'utf8', function(){
        Me.Expecting.push([function(){
          Array.prototype.unshift.call(arguments, null);
          Callback.apply(null, arguments);
        }, function(Error){
          Callback(Error, null);
        }]);
      });
    }
  };
  Redis.prototype[Entry] = Execute;
  Redis.prototype[Entry.toLowerCase()] = Execute;
});

Redis.prototype.end = Redis.prototype.close;
module.exports = Redis;