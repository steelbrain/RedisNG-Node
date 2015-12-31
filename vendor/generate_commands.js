#!/usr/bin/env node
'use strict'

const HTTP = require('http')
const StreamPromise = require('sb-stream-promise')
const Path = require('path')
const FS = require('fs')

HTTP.get('http://redis.io/commands.json', function(res) {
  return StreamPromise.create(res, 1024 * 1024).then(function(contents) {
    const commands = JSON.parse(contents)
    const keys = []
    for (let key in commands) {
      keys.push(key)
    }
    const fileContents = 'module.exports = ' + JSON.stringify(keys)
    return new Promise(function(resolve, reject) {
      FS.writeFile(Path.join(__dirname, 'commands.js'), fileContents, function(error) {
        if (error) {
          reject(error)
        } else resolve()
      })
    })
  }, function(e) {
    console.log(e.message, e.stack)
  })
}).on('error', function(e) {
  console.log(e.message, e.stack)
})
