

var IsIoJS = parseInt(process.version.substr(1)) > 0;
if(IsIoJS){
  module.exports = require('./Source/Main');
} else {
  throw new Error("Redis-Promise consumes generators so is only supported on io.js");
}
