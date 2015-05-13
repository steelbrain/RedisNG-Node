Redis-Promise
===========
Redis-Promise is a redis client for io.js where You are the :tophat: boss. It's extremely lightweight, and allows you to freely choose between callbacks and promises. and not only that, Redis-Proto also triggers channel-specific subscription events, so you won't have to check for the channel in each of your listeners.

#### Installation
In your project root do
```bash
npm install redis-promise
```
or add it to your dependencies.

#### Using Promises
Using promises makes using Redis-Promise a piece of silky cake.
```js
var Redis = require('redis-promise')
var Client = new Redis()
Client.connect().then(function(){
  Client.get('MyKey').then(JSON.parse).then(function(Value){
  console.log(Value) // Outputs the value or null
  })
  Client.get('MyKey', 'InvalidOption').then(function(Value){}).catch(function(Error){
    console.log(Error) // [Error: ERR wrong number of arguments for 'get' command]
  })
});
```

#### Using Callbacks
If you don't like the Promise overhead and want a plain callback API. Redis-Promise has got you covered!
```js
var Redis = require('redis-promise')
var Client = new Redis()
Client.connect("localhost", 6379, function(){
  Client.get("myKey", function(Error, Value){
    console.log(Error) // null
    console.log(Value) // a string or null value
  })
  Client.get("myKey", "invalidArg", function(Error, Value){
    console.log(Error) // [Error: ERR wrong number of arguments for 'get' command]
    console.log(Value) // null
  })
})
```

#### Pub/Sub
Almost all of the Redis API Clients support Pub/Sub, but I haven't come across a single one that supports them beautifully, like Redis-Promise does.
```js
var Redis = require('./Main');
var Subscriber = new Redis();
var Client = new Redis()
Subscriber.connect(Client.connect()).then(function(){
  Subscriber.subscribe("chan1")
  Subscriber.subscribe("chan2")
  Subscriber.on('message:chan1', function(Message){
    console.log(Message) // I am chan1
  })
  Subscriber.on('message:chan2', function(Message){
    console.log(Message) // I am chan2
  })
  Subscriber.on('message', function(Channel, Message){
    console.log(Channel, Message) // prints both of the values above
  })
  Client.publish("chan1", "I am chan1")
  Client.publish("chan2", "I am chan2")
})
```

#### API

```js
class Redis extends EventEmitter{
  connect(Host = '127.0.0.1', Port = 6379, ?Callback)
  ref() // See Node's net.Socket ref documentation
  unref() // See Node's net.Socket unref documentation
  close() // Force Close the socket, use quit() for graceful shutdown
  ... All the Redis functions ...
}
```

#### License
This project is licensed under the terms of MIT license. See the License file for more info.